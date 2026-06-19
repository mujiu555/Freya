{-# LANGUAGE LambdaCase #-}
module Main (main) where

import Freya.Types
import Freya.Lexer  (lexFreya)
import Freya.Parser (parse)
import System.Environment (getArgs)
import System.Exit (exitFailure, exitSuccess)
import System.IO (hPutStrLn, stderr)

main :: IO ()
main = do
  args <- getArgs
  src <- case args of
    [path] -> readFile path
    _ -> getContents

  case lexFreya src of
    Left err -> do
      hPutStrLn stderr $ "Lexer error: " ++ show err
      exitFailure
    Right (tokens, lexErrors) -> do
      let st0 = ParseState lexErrors
          (finalSt, ast) = parse st0 tokens

      -- Print errors to stderr
      mapM_ (hPutStrLn stderr . prettyError) (errors finalSt)

      -- Print AST to stdout (as structured output)
      putStrLn $ prettyExprs ast

      -- Exit with failure if there were errors
      if null (errors finalSt)
        then exitSuccess
        else exitFailure

----------------------------------------------------------------------
-- Pretty-printing
----------------------------------------------------------------------

prettyError :: FreyaError -> String
prettyError (FreyaError rng msg) =
  unwords
    [ show (line (start rng)) ++ ":" ++ show (column (start rng))
    , "-"
    , show (line (end rng)) ++ ":" ++ show (column (end rng))
    , msg
    ]

prettyExprs :: [Expr] -> String
prettyExprs = unlines . map prettyExpr

prettyExpr :: Expr -> String
prettyExpr = \case
  Atom t -> prettyToken t
  SList _ children -> "( " ++ unwords (map prettyExpr children) ++ " )"

prettyToken :: Token -> String
prettyToken = \case
  TokLParen{} -> "("
  TokRParen{} -> ")"
  TokLCurly{} -> "{"
  TokRCurly{} -> "}"
  TokLSquare{} -> "["
  TokRSquare{} -> "]"
  TokText _ s -> show s
  TokInt _ n -> show n
  TokIdent _ s -> s
  TokHole{} -> "_"
