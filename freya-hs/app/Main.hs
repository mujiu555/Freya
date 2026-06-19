module Main where

import System.Environment (getArgs)
import Freya (parseToplevel)

main :: IO ()
main = do
  args <- getArgs
  case args of
    [file] -> do
      src <- readFile file
      case parseToplevel src file of
        Left err  -> putStrLn ("Parse error: " ++ err)
        Right ast -> mapM_ print ast
    _ -> do
      putStrLn "Usage: freya-hs <file.fry>"
