{
  description = "A very basic flake";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "git+https://mirrors.nju.edu.cn/git/nixpkgs.git?ref=nixos-26.05&shallow=1";
    haskell-flake.url = "github:srid/haskell-flake";
  };

  outputs =
    inputs@{
      self,
      nixpkgs,
      flake-parts,
      ...
    }:
    inputs.flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import inputs.nixpkgs { inherit system; };
      in
      {
        imports = [ inputs.haskell-flake.flakeModule ];
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            vtsls
            vue-language-server
            typescript
            typescript-language-server

            ghc # Glasgow Haskell Compiler
            cabal-install # 构建工具
            haskell-language-server # LSP 服务器（IDE 支持）
            ghcid # 快速重载式类型检查
            haskellPackages.parsec
          ];
          shellHook = ''
            export PATH="$PWD/node_modules/.bin/:$PATH"
            export NPM_PACKAGES="$PWD/.npm-packages"

            export SHELL="/run/current-system/sw/bin/bash" ;
            export shell="/run/current-system/sw/bin/bash" ;
          '';
        };
      }
    );
}
