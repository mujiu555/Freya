module Freya.Types
  ( Atom (..)
  , Expr (..)
  ) where

-- | Atomic values: holes, identifiers, integers, and strings.
data Atom
  = AtomHole
  | AtomIdentifier String
  | AtomInteger Integer
  | AtomString String
  deriving (Show, Eq)

-- | Expressions are either atoms or parenthesised lists.
data Expr
  = ExprAtom Atom
  | ExprList [Expr]
  deriving (Show, Eq)
