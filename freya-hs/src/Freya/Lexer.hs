module Freya.Lexer
  ( -- * Token type
    Token (..)

    -- * Lexer combinators
  , lexeme
  , whiteSpace
  , integer
  , identifier
  , hole_
  , string_
  , lparen
  , rparen
  , tokenize

    -- * Re-exports from Text.Parsec.Char
  , digit
  ) where

import Text.Parsec (Parsec, (<|>), eof, many, many1, noneOf, skipMany, try, (<?>))
import Text.Parsec.Char (digit, space)
import qualified Text.Parsec.Char as C

-- ---------------------------------------------------------------------------
-- Token type
-- ---------------------------------------------------------------------------

data Token
  = TokInteger Integer
  | TokIdentifier String
  | TokHole
  | TokString String
  | TokLParen
  | TokRParen
  deriving (Show, Eq)

-- ---------------------------------------------------------------------------
-- Whitespace & comments
-- ---------------------------------------------------------------------------

-- | A single-line comment: @; … \\n@
comment :: Parsec String () ()
comment = do
  _ <- C.char ';'
  _ <- many (noneOf "\n")
  _ <- C.char '\n'
  return ()
  <?> "comment"

-- | Skip whitespace and comments.
whiteSpace :: Parsec String () ()
whiteSpace = skipMany (space *> pure () <|> comment) <?> "whitespace"

-- ---------------------------------------------------------------------------
-- Lexeme combinator
-- ---------------------------------------------------------------------------

-- | Run a parser and then skip any trailing whitespace / comments.
lexeme :: Parsec String () a -> Parsec String () a
lexeme p = p <* whiteSpace

-- ---------------------------------------------------------------------------
-- Token parsers
-- ---------------------------------------------------------------------------

-- | Integer literal: one or more digits.
integer :: Parsec String () Token
integer = TokInteger . read <$> lexeme (many1 digit) <?> "integer"

-- | Identifier: starts with a lowercase letter, continues with lowercase
-- letters, digits, or hyphens.
identifier :: Parsec String () Token
identifier = lexeme (TokIdentifier <$> ident) <?> "identifier"
  where
    ident = do
      headChar <- C.lower
      tailChars <- many (C.lower <|> digit <|> C.char '-')
      return (headChar : tailChars)

-- | Hole: a single underscore.
hole_ :: Parsec String () Token
hole_ = lexeme (TokHole <$ C.char '_') <?> "hole"

-- | String literal: double-quoted, may contain any character except @\"@
-- and newline (per the spec: U+0000..U+0009, U+000B..U+0021, U+0023..U+FFFF).
string_ :: Parsec String () Token
string_ = lexeme (TokString <$> str) <?> "string"
  where
    str = do
      _ <- C.char '"'
      -- everything except double-quote and newline matches the spec union
      cs <- many (noneOf "\"\n")
      _ <- C.char '"'
      return cs

-- | Left parenthesis.
lparen :: Parsec String () Token
lparen = lexeme (TokLParen <$ C.char '(') <?> "'('"

-- | Right parenthesis.
rparen :: Parsec String () Token
rparen = lexeme (TokRParen <$ C.char ')') <?> "')'"

-- ---------------------------------------------------------------------------
-- Full tokenizer
-- ---------------------------------------------------------------------------

-- | Parse any single token, skipping leading whitespace.
anyToken :: Parsec String () Token
anyToken =
  whiteSpace *>
    ( try string_
    <|> try hole_
    <|> try identifier
    <|> try integer
    <|> lparen
    <|> rparen
    )

-- | Tokenize the entire input into a list of tokens.
tokenize :: Parsec String () [Token]
tokenize = whiteSpace *> many anyToken <* eof
