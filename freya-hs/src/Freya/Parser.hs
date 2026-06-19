{-# LANGUAGE LambdaCase #-}
module Freya.Parser
  ( -- * Parsing entry points
    parseExpr
  , parseToplevel

    -- * Re-exports from Text.Parsec
  , parse
  ) where

import Text.Parsec (parse)
import Freya.Types (Atom (..), Expr (..))
import Freya.Lexer (Token (..), tokenize)

-- ---------------------------------------------------------------------------
-- Internal parser over the token list
-- ---------------------------------------------------------------------------

type Parse a = [Token] -> Either String (a, [Token])

-- | Succeed consuming no input.
unit :: a -> Parse a
unit x toks = Right (x, toks)


-- | Bind.
bindParse :: Parse a -> (a -> Parse b) -> Parse b
bindParse p f toks = case p toks of
  Left err        -> Left err
  Right (x, toks') -> f x toks'

-- | Try the first parser; if it fails, try the second.
altParse :: Parse a -> Parse a -> Parse a
altParse p q toks = case p toks of
  Left _ -> q toks
  r      -> r

-- | Match a token satisfying the predicate, returning the extracted value.
satisfy :: (Token -> Maybe a) -> String -> Parse a
satisfy _f label [] =
  Left ("expected " ++ label ++ " but reached end of input")
satisfy f label (t : toks) = case f t of
  Just a  -> Right (a, toks)
  Nothing -> Left ("expected " ++ label ++ " but got " ++ show t)

-- | Match an exact token.
matchToken :: Token -> Parse Token
matchToken tok = satisfy (\t -> if t == tok then Just t else Nothing) (show tok)

-- | Zero or more.
manyParse :: Parse a -> Parse [a]
manyParse p toks0 = loop toks0 []
  where
    loop toks acc = case p toks of
      Left _            -> Right (reverse acc, toks)
      Right (x, toks')  -> loop toks' (x : acc)

-- ---------------------------------------------------------------------------
-- Grammar
-- ---------------------------------------------------------------------------

-- | <atom> ::= <hole> | <identifier> | <integer> | <string>
parseAtom :: Parse Atom
parseAtom =
  altParse (bindParse (satisfy
    (\case TokHole -> Just (); _ -> Nothing) "hole")
    (\() -> unit AtomHole))
  $ altParse (bindParse (satisfy
    (\case TokIdentifier s -> Just s; _ -> Nothing) "identifier")
    (\s -> unit (AtomIdentifier s)))
  $ altParse (bindParse (satisfy
    (\case TokInteger n -> Just n; _ -> Nothing) "integer")
    (\n -> unit (AtomInteger n)))
  $ bindParse (satisfy
    (\case TokString s -> Just s; _ -> Nothing) "string")
    (\s -> unit (AtomString s))

-- | <expr> ::= <atom> | <list>
parseExpr_ :: Parse Expr
parseExpr_ = altParse
  (bindParse parseAtom (\a -> unit (ExprAtom a)))
  parseList

-- | <list> ::= "(" <expr>* ")"
parseList :: Parse Expr
parseList =
  bindParse (matchToken TokLParen) $ \_ ->
  bindParse (manyParse parseExpr_) $ \es ->
  bindParse (matchToken TokRParen) $ \_ ->
  unit (ExprList es)

-- | Full parse of a single expression.
runParser :: [Token] -> Either String (Expr, [Token])
runParser = parseExpr_

-- | Full parse of toplevel expressions.
runParserToplevel :: [Token] -> Either String ([Expr], [Token])
runParserToplevel = manyParse parseExpr_

-- ---------------------------------------------------------------------------
-- Public API
-- ---------------------------------------------------------------------------

-- | Parse a token stream into a single expression.
parseExprFromTokens :: [Token] -> Either String Expr
parseExprFromTokens toks = case runParser toks of
  Left err       -> Left err
  Right (e, [])  -> Right e
  Right (_, leftover) ->
    Left ("unexpected trailing tokens: " ++ show leftover)

-- | Parse a token stream into a list of toplevel expressions.
parseToplevelFromTokens :: [Token] -> Either String [Expr]
parseToplevelFromTokens toks = case runParserToplevel toks of
  Left err        -> Left err
  Right (es, [])  -> Right es
  Right (_, leftover) ->
    Left ("unexpected trailing tokens: " ++ show leftover)

-- | Parse a string into a single expression.
parseExpr :: String -> FilePath -> Either String Expr
parseExpr input name =
  case parse tokenize name input of
    Left err   -> Left (show err)
    Right toks -> parseExprFromTokens toks

-- | Parse a string into a list of toplevel expressions.
parseToplevel :: String -> FilePath -> Either String [Expr]
parseToplevel input name =
  case parse tokenize name input of
    Left err   -> Left (show err)
    Right toks -> parseToplevelFromTokens toks
