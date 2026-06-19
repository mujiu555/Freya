module Freya.Parser
  ( makeParseState,
    parse,
  )
where

import Freya.Types

----------------------------------------------------------------------
-- Internal parser state
----------------------------------------------------------------------

-- | A frame on the context stack: an open left delimiter and its
-- accumulated children (in reverse order).
data Frame = Frame
  { frameLeft :: !Token -- ^ the left delimiter token that opened this frame
  , frameKids :: [Expr] -- ^ accumulated children, reversed
  }

-- | Internal parser state during token processing.
data PState = PState
  { pResult :: [Expr] -- ^ completed top-level expressions, reversed
  , pStack :: [Frame] -- ^ stack of open frames (innermost first)
  , pErrors :: [FreyaError] -- ^ accumulated errors
  }

-- | Initial internal state.
initPState :: PState
initPState = PState [] [] []

----------------------------------------------------------------------
-- Public API
----------------------------------------------------------------------

-- | Parse a list of tokens into a list of expressions, using the
-- error-recovery strategy from the TypeScript reference implementation.
--
-- The initial 'ParseState' can carry pre-existing errors (e.g. from
-- the lexer); any new errors discovered during parsing are appended.
parse :: ParseState -> [Token] -> (ParseState, [Expr])
parse st toks =
  let seed = initPState {pErrors = errors st}
      finalSt = finalize $ foldl' step seed toks
   in ( ParseState (pErrors finalSt),
        reverse (pResult finalSt)
      )

----------------------------------------------------------------------
-- Step function: process one token
----------------------------------------------------------------------

step :: PState -> Token -> PState
step st tok = case tok of
  -- Left delimiters: open a new frame
  TokLParen{} -> pushFrame st tok
  TokLSquare{} -> pushFrame st tok
  TokLCurly{} -> pushFrame st tok

  -- Right delimiters: attempt to close the innermost frame
  TokRParen{} -> popFrame st tok
  TokRSquare{} -> popFrame st tok
  TokRCurly{} -> popFrame st tok

  -- Atoms: push to the current level
  _ -> pushAtom st (Atom tok)

----------------------------------------------------------------------
-- Push a new frame (left delimiter seen)
----------------------------------------------------------------------

pushFrame :: PState -> Token -> PState
pushFrame st tok = st {pStack = Frame tok [] : pStack st}

----------------------------------------------------------------------
-- Push an atom onto the current level
----------------------------------------------------------------------

pushAtom :: PState -> Expr -> PState
pushAtom st atom = case pStack st of
  [] ->
    -- Top level: add to result
    st {pResult = atom : pResult st}
  (f : fs) ->
    -- Inside a frame: add to that frame's children
    st {pStack = f {frameKids = atom : frameKids f} : fs}

----------------------------------------------------------------------
-- Pop a frame (right delimiter seen)
----------------------------------------------------------------------

popFrame :: PState -> Token -> PState
popFrame st tok = case pStack st of
  [] ->
    -- No open frame: this is a lone right delimiter.
    -- Replace with a hole and report an error.
    let hole = TokHole (tokenRange tok)
        err = FreyaError (tokenRange tok) "lone delimiter"
     in st
          { pErrors = err : pErrors st,
            pResult = Atom hole : pResult st
          }

  (f : fs) ->
    let matches = case (frameLeft f, tok) of
          (TokLParen{}, TokRParen{}) -> True
          (TokLSquare{}, TokRSquare{}) -> True
          (TokLCurly{}, TokRCurly{}) -> True
          _ -> False

        -- Create an slist covering from the left bracket to the right bracket
        sl =
          SList
            ( Range
                (start (tokenRange (frameLeft f)))
                (end (tokenRange tok))
            )
            (reverse (frameKids f))
     in if matches
          then
            -- Matching delimiters: reduce children into an slist
            case fs of
              [] ->
                st
                  { pStack = [],
                    pResult = sl : pResult st
                  }
              (parent : ps) ->
                st
                  { pStack = parent {frameKids = sl : frameKids parent} : ps
                  }
          else
            -- Mismatched delimiters: reduce anyway and report an error
            let err = FreyaError (tokenRange tok) "mismatch delimiter"
             in case fs of
                  [] ->
                    st
                      { pStack = [],
                        pResult = sl : pResult st,
                        pErrors = err : pErrors st
                      }
                  (parent : ps) ->
                    st
                      { pStack = parent {frameKids = sl : frameKids parent} : ps,
                        pErrors = err : pErrors st
                      }

----------------------------------------------------------------------
-- End-of-input recovery: collapse all unclosed frames
----------------------------------------------------------------------

-- | After all tokens are consumed, collapse any remaining open frames
-- into slists and report "lone delimiter" errors for each.
finalize :: PState -> PState
finalize st = go (pResult st) (pStack st) (pErrors st)
  where
    go result [] errs =
      st {pResult = result, pStack = [], pErrors = errs}
    go result (Frame left kids : frames) errs =
      let sl =
            SList (tokenRange left) (reverse kids)
          err = FreyaError (tokenRange left) "lone delimiter"
          errs' = err : errs
       in case frames of
            [] ->
              -- Outermost frame: slist goes to top-level result
              go (sl : result) [] errs'
            (parent : ps) ->
              -- Inner frame: slist goes to parent frame's children
              go result (parent {frameKids = sl : frameKids parent} : ps) errs'
