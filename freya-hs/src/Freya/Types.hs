{-# LANGUAGE LambdaCase #-}

module Freya.Types
  ( -- * Positions and ranges
    Position (..),
    Range (..),

    -- * Tokens
    Token (..),

    -- * Expressions
    Expr (..),

    -- * Errors
    FreyaError (..),

    -- * Parser state
    ParseState (..),
    makeParseState,

    -- * Utilities
    tokenRange,
  )
where

----------------------------------------------------------------------
-- Position and Range
----------------------------------------------------------------------

-- | Zero-based position in source text.
data Position = Position
  { line :: !Int  -- ^ 0-based line number
  , column :: !Int  -- ^ 0-based character offset within the line
  }
  deriving (Show, Eq)

-- | A span in source text from start to end position.
data Range = Range
  { start :: !Position
  , end :: !Position
  }
  deriving (Show, Eq)

----------------------------------------------------------------------
-- Token
----------------------------------------------------------------------

-- | All token types produced by the lexer.
data Token
  = TokLParen !Range  -- ^ @(@ left parenthesis
  | TokRParen !Range  -- ^ @)@ right parenthesis
  | TokLCurly !Range  -- ^ @{@ left curly bracket
  | TokRCurly !Range  -- ^ @}@ right curly bracket
  | TokLSquare !Range -- ^ @[@ left square bracket
  | TokRSquare !Range -- ^ @]@ right square bracket
  | TokText !Range !String -- ^ string literal (content without quotes)
  | TokInt !Range !Integer -- ^ integer literal
  | TokIdent !Range !String -- ^ identifier @[a-z][a-z0-9-]*@
  | TokHole !Range -- ^ hole @_@ or unknown token
  deriving (Show, Eq)

-- | Extract the range from any token.
tokenRange :: Token -> Range
tokenRange = \case
  TokLParen r -> r
  TokRParen r -> r
  TokLCurly r -> r
  TokRCurly r -> r
  TokLSquare r -> r
  TokRSquare r -> r
  TokText r _ -> r
  TokInt r _ -> r
  TokIdent r _ -> r
  TokHole r -> r

----------------------------------------------------------------------
-- Expression (AST)
----------------------------------------------------------------------

-- | A Freya expression: either an atom (wrapping a token) or an
-- s-expression list.
data Expr
  = Atom !Token -- ^ atomic value
  | SList !Range [Expr] -- ^ s-expression list with children
  deriving (Show, Eq)

----------------------------------------------------------------------
-- Error
----------------------------------------------------------------------

-- | A parse error with a source range and message.
data FreyaError = FreyaError
  { errorRange :: !Range
  , errorMessage :: !String
  }
  deriving (Show, Eq)

----------------------------------------------------------------------
-- Parse state
----------------------------------------------------------------------

-- | Accumulated parser state returned after parsing.
data ParseState = ParseState
  { errors :: [FreyaError] -- ^ accumulated error diagnostics
  }
  deriving (Show, Eq)

-- | Create a fresh, empty parse state.
makeParseState :: ParseState
makeParseState = ParseState []
