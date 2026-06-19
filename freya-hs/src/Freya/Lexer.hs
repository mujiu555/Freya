module Freya.Lexer
  ( lexFreya,
  )
where

import Control.Monad.Trans.Class (lift)
import Control.Monad.Trans.State.Strict (StateT, modify, runStateT)
import Data.Char (isDigit, isSpace, isLower)
import Data.Functor.Identity (Identity, runIdentity)
import Freya.Types hiding (start, end, errors)
import Text.Parsec
  ( ParseError,
    ParsecT,
    SourcePos,
    (<?>),
  )
import qualified Text.Parsec as P
  ( char,
    choice,
    eof,
    getPosition,
    many,
    many1,
    runParserT,
    satisfy,
    skipMany,
    sourceColumn,
    sourceLine,
    (<|>),
  )

----------------------------------------------------------------------
-- Lexer monad
----------------------------------------------------------------------

-- | Lexer monad: ParsecT stacked on StateT for accumulating
-- non-fatal lexer errors (e.g. unknown tokens).
type Lexer a = ParsecT String () (StateT [FreyaError] Identity) a

-- | Emit a non-fatal lexer error.
lexerError :: FreyaError -> Lexer ()
lexerError err = lift $ modify (err :)

----------------------------------------------------------------------
-- Lexer entry point
----------------------------------------------------------------------

-- | Tokenize a Freya source string into a list of tokens and any
-- non-fatal lexer errors (e.g. unknown tokens).
lexFreya :: String -> Either ParseError ([Token], [FreyaError])
lexFreya input =
  let lexer = P.skipMany skipWs *> P.many (token <* P.skipMany skipWs) <* P.eof
      (result, lexErrors) =
        runIdentity $ runStateT (P.runParserT lexer () "" input) []
   in case result of
        Left err -> Left err
        Right toks -> Right (toks, reverse lexErrors)

----------------------------------------------------------------------
-- Whitespace and comments
----------------------------------------------------------------------

-- | Skip a single whitespace run or comment.
skipWs :: Lexer ()
skipWs = simpleSpace P.<|> comment
  where
    -- Space, tab, newline, CR, VT, FF
    simpleSpace = P.satisfy (\c -> c `elem` (" \t\n\r\v\f" :: [Char])) *> pure ()
    -- Comment: @;@ to end of line (newline not consumed)
    comment = P.char ';' *> P.skipMany (P.satisfy (/= '\n'))

----------------------------------------------------------------------
-- Token parsers
----------------------------------------------------------------------

-- | Parse a single token.
token :: Lexer Token
token =
  P.choice
    [ tokLParen,
      tokRParen,
      tokLSquare,
      tokRSquare,
      tokLCurly,
      tokRCurly,
      lexString,
      lexIdent,
      lexInteger,
      tokHole,
      lexUnknown
    ]
    <?> "token"

----------------------------------------------------------------------
-- Single-character token helpers
----------------------------------------------------------------------

-- | Parse a token that is a single known character, producing a range
-- that covers that character.
singleTok :: (Range -> Token) -> Char -> Lexer Token
singleTok ctor c = do
  p0 <- P.getPosition
  _ <- P.char c
  p1 <- P.getPosition
  let r = Range (toPos p0) (toPos p1)
  return $ ctor r

tokLParen :: Lexer Token
tokLParen = singleTok TokLParen '('

tokRParen :: Lexer Token
tokRParen = singleTok TokRParen ')'

tokLSquare :: Lexer Token
tokLSquare = singleTok TokLSquare '['

tokRSquare :: Lexer Token
tokRSquare = singleTok TokRSquare ']'

tokLCurly :: Lexer Token
tokLCurly = singleTok TokLCurly '{'

tokRCurly :: Lexer Token
tokRCurly = singleTok TokRCurly '}'

tokHole :: Lexer Token
tokHole = singleTok TokHole '_'

----------------------------------------------------------------------
-- Multi-character token parsers
----------------------------------------------------------------------

-- | Parse a string literal @"..."@.
-- The range covers the opening and closing quotes.
-- The stored text does NOT include the quotes.
lexString :: Lexer Token
lexString = do
  p0 <- P.getPosition
  _ <- P.char '"'
  s <- P.many (P.satisfy (\c -> c /= '"' && c /= '\n' && c /= '\r'))
  _ <- P.char '"' P.<|> P.satisfy (\c -> c == '\n' || c == '\r')
  p1 <- P.getPosition
  let r = Range (toPos p0) (toPos p1)
  return $ TokText r s

-- | Parse an identifier: @[a-z][a-z0-9-]*@.
lexIdent :: Lexer Token
lexIdent = do
  p0 <- P.getPosition
  c <- P.satisfy isLower
  cs <- P.many (P.satisfy (\x -> isLower x || isDigit x || x == '-'))
  p1 <- P.getPosition
  let r = Range (toPos p0) (toPos p1)
  return $ TokIdent r (c : cs)

-- | Parse an integer: @[0-9]+@.
lexInteger :: Lexer Token
lexInteger = do
  p0 <- P.getPosition
  ds <- P.many1 (P.satisfy isDigit)
  p1 <- P.getPosition
  let r = Range (toPos p0) (toPos p1)
  return $ TokInt r (read ds)

-- | Parse unknown characters.
-- Groups consecutive characters that don't start any known token
-- into a single hole token and reports an \"unknown token\" error.
lexUnknown :: Lexer Token
lexUnknown = do
  p0 <- P.getPosition
  _ <- P.many1 (P.satisfy (not . isKnownTokenStart))
  p1 <- P.getPosition
  let r = Range (toPos p0) (toPos p1)
  lexerError $ FreyaError r "unknown token"
  return $ TokHole r
  where
    isKnownTokenStart c =
      c `elem` ("()[]{}_\"';" :: [Char])
        || isLower c
        || isDigit c
        || isSpace c

----------------------------------------------------------------------
-- Position conversion
----------------------------------------------------------------------

-- | Convert Parsec's 1-based 'SourcePos' to our 0-based 'Position'.
toPos :: SourcePos -> Position
toPos sp = Position (P.sourceLine sp - 1) (P.sourceColumn sp - 1)
