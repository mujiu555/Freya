"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));

// parser.ts
var int = {
  parse: (self) => parseInt(self)
};
var str = {
  code_unit_at: (self, n) => self.charCodeAt(n),
  slice: (self, s, e) => self.slice(s, e)
};
var none = void 0;
var stack = {
  truncate: (self, n) => {
    self.length = n;
  },
  push: (self, v) => {
    self.push(v);
  },
  pop: (self) => self.pop(),
  peek: (self) => self.length === 0 ? none : self[self.length - 1],
  drain: (self, s, e) => self.splice(s, e - s),
  copy_nonoverlapping: (src, sofs, dst, dofs, len) => {
    for (let i = sofs, j = dofs; j < dofs + len; i++, j++) {
      dst[j] = src[i];
    }
  }
};
var position = (line, character) => ({ line, character });
var range = (start, end) => ({ start, end });
var token = {
  left_parenthesis: (range3) => ({ tag: "left_parenthesis", range: range3 }),
  right_parenthesis: (range3) => ({ tag: "right_parenthesis", range: range3 }),
  left_curly_bracket: (range3) => ({ tag: "right_curly_bracket", range: range3 }),
  right_curly_bracket: (range3) => ({ tag: "left_curly_bracket", range: range3 }),
  left_square_bracket: (range3) => ({ tag: "left_square_bracket", range: range3 }),
  right_square_bracket: (range3) => ({ tag: "tsqrbrakt", range: range3 }),
  text: (range3, text) => ({ tag: "text", range: range3, text }),
  integer: (range3, data) => ({ tag: "integer", range: range3, data }),
  identifier: (range3, text) => ({ tag: "identifier", range: range3, text }),
  hole: (range3) => ({ tag: "hole", range: range3 })
};
var slist = (range3, children) => ({
  tag: "slist",
  range: range3,
  children
});
var frame = (akr, lft) => ({ akr, lft });
var error = (range3, message) => ({ range: range3, message });
var parser = Object.assign(
  // prettier-ignore
  (text, ln, ch, ix, pen, ctx, rpt) => ({ text, line: ln, character: ch, index: ix, pending: pen, context: ctx, report: rpt }),
  {
    // prettier-ignore
    // next token 
    next: (self) => {
      let pln = self.line;
      let pch = self.character;
      let pix = self.index;
      let ln = pln;
      let ch = pch;
      let ix = pix;
      k1: while (ix < self.text.length) {
        let cu = str.code_unit_at(self.text, ix);
        switch (cu) {
          case 40: {
            ch++;
            ix++;
            self.line = ln;
            self.character = ch;
            self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.left_parenthesis(r);
          }
          case 41: {
            ch++;
            ix++;
            self.line = ln;
            self.character = ch;
            self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.right_parenthesis(r);
          }
          case 91: {
            ch++;
            ix++;
            self.line = ln;
            self.character = ch;
            self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.left_square_bracket(r);
          }
          case 93: {
            ch++;
            ix++;
            self.line = ln;
            self.character = ch;
            self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.right_square_bracket(r);
          }
          case 123: {
            ch++;
            ix++;
            self.line = ln;
            self.character = ch;
            self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.right_curly_bracket(r);
          }
          case 125: {
            ch++;
            ix++;
            self.line = ln;
            self.character = ch;
            self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.left_curly_bracket(r);
          }
          case 95: {
            ch++;
            ix++;
            self.line = ln;
            self.character = ch;
            self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.hole(r);
          }
          case 59: {
            ch++;
            ix++;
            k2: while (ix < self.text.length) {
              let cu2 = str.code_unit_at(self.text, ix);
              if (cu2 !== 10) {
                ch++;
                ix++;
                continue k2;
              } else {
                break k2;
              }
            }
            self.line = ln;
            self.character = ch;
            self.index = ix;
            pln = ln;
            pch = ch;
            pix = ix;
            continue k1;
          }
          case 34: {
            let s = ix;
            ch++;
            ix++;
            k2: while (ix < self.text.length) {
              let cu2 = str.code_unit_at(self.text, ix);
              if (cu2 !== 34 && cu2 !== 10) {
                ch++;
                ix++;
                continue k2;
              } else {
                ch++;
                ix++;
                break k2;
              }
            }
            let e = ix;
            let span = str.slice(self.text, s, e);
            self.line = ln;
            self.character = ch;
            self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.text(r, span);
          }
          case 10: {
            ln++;
            ch = 0;
            ix++;
            self.line = ln;
            self.character = ch;
            self.index = ix;
            pln = ln;
            pch = ch;
            pix = ix;
            continue k1;
          }
          // ' ' | HT | CR | VT | FF
          case 9:
          case 11:
          case 12:
          case 13:
          case 32: {
            ch++;
            ix++;
            k2: while (ix < self.text.length) {
              let cu2 = str.code_unit_at(self.text, ix);
              if (11 <= cu2 && cu2 <= 13 || cu2 === 9 || cu2 === 32) {
                ch++;
                ix++;
                continue k2;
              } else {
                break k2;
              }
            }
            self.line = ln;
            self.character = ch;
            self.index = ix;
            pln = ln;
            pch = ch;
            pix = ix;
            continue k1;
          }
          //  'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
          case 97:
          case 98:
          case 99:
          case 100:
          case 101:
          case 102:
          case 103:
          case 104:
          case 105:
          case 106:
          case 107:
          case 108:
          case 109:
          case 110:
          case 111:
          case 112:
          case 113:
          case 114:
          case 115:
          case 116:
          case 117:
          case 118:
          case 119:
          case 120:
          case 121:
          case 122: {
            let s = ix;
            ch++;
            ix++;
            k2: while (ix < self.text.length) {
              let cu2 = str.code_unit_at(self.text, ix);
              if (97 <= cu2 && cu2 <= 122 || 48 <= cu2 && cu2 <= 57 || cu2 === 45) {
                ch++;
                ix++;
                continue k2;
              } else {
                break k2;
              }
            }
            let e = ix;
            let span = str.slice(self.text, s, e);
            self.line = ln;
            self.character = ch;
            self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.identifier(r, span);
          }
          // '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
          case 48:
          case 49:
          case 50:
          case 51:
          case 52:
          case 53:
          case 54:
          case 55:
          case 56:
          case 57: {
            let s = ix;
            ch++;
            ix++;
            while (ix < self.text.length) {
              let cu2 = str.code_unit_at(self.text, ix);
              if (48 <= cu2 && cu2 <= 57) {
                ch++;
                ix++;
                continue;
              } else {
                break;
              }
            }
            let e = ix;
            let span = str.slice(self.text, s, e);
            self.line = ln;
            self.character = ch;
            self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.integer(r, int.parse(span));
          }
          default: {
            ch++;
            ix++;
            k2: while (ix < self.text.length) {
              let cu2 = str.code_unit_at(self.text, ix);
              switch (cu2) {
                case 59:
                // ';'
                case 34:
                // '"'
                case 40:
                case 41:
                // '(' | ')'
                case 91:
                case 93:
                // '[' | ']'
                case 123:
                case 125:
                // '{' | '}'
                case 95:
                // '_'
                case 10:
                // LF 
                case 9:
                case 11:
                case 12:
                case 13:
                case 32:
                // HT | VT | FF | CR | ' '
                //  'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
                case 97:
                case 98:
                case 99:
                case 100:
                case 101:
                case 102:
                case 103:
                case 104:
                case 105:
                case 106:
                case 107:
                case 108:
                case 109:
                case 110:
                case 111:
                case 112:
                case 113:
                case 114:
                case 115:
                case 116:
                case 117:
                case 118:
                case 119:
                case 120:
                case 121:
                case 122:
                // '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57: {
                  break k2;
                }
                default: {
                  ch++;
                  ix++;
                  continue k2;
                }
              }
            }
            self.line = ln;
            self.character = ch;
            self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            stack.push(self.report, error(r, "unknown token"));
            return token.hole(r);
          }
        }
      }
      return none;
    },
    // prettier-ignore
    // parse token without context 
    advance: (self, t) => {
      w1: switch (t.tag) {
        case "left_parenthesis":
        case "left_curly_bracket":
        case "left_square_bracket": {
          stack.push(self.context, frame(self.pending.length, t));
          break w1;
        }
        case "right_parenthesis":
        case "right_curly_bracket":
        case "tsqrbrakt": {
          stack.push(self.report, error(t.range, "lone delimiter"));
          stack.push(self.pending, token.hole(t.range));
          break w1;
        }
        case "text":
        case "integer":
        case "identifier":
        case "hole": {
          stack.push(self.pending, t);
          break w1;
        }
      }
    },
    // prettier-ignore
    // parse token with context 
    matching: (self, f, t) => {
      w1: switch (f.lft.tag) {
        case "left_parenthesis": {
          w2: switch (t.tag) {
            case "left_parenthesis":
            case "left_curly_bracket":
            case "left_square_bracket": {
              stack.push(self.context, frame(self.pending.length, t));
              break w2;
            }
            case "right_parenthesis": {
              stack.pop(self.context);
              let children = stack.drain(self.pending, f.akr, self.pending.length);
              let r = range(f.lft.range.start, t.range.end);
              stack.push(self.pending, slist(r, children));
              break w2;
            }
            case "right_curly_bracket":
            case "tsqrbrakt": {
              stack.push(self.report, error(t.range, "mismatch delimiter"));
              stack.pop(self.context);
              let children = stack.drain(self.pending, f.akr, self.pending.length);
              let r = range(f.lft.range.start, t.range.end);
              stack.push(self.pending, slist(r, children));
              break w2;
            }
            case "text":
            case "integer":
            case "identifier":
            case "hole": {
              stack.push(self.pending, t);
              break w2;
            }
          }
          break w1;
        }
        case "left_curly_bracket": {
          w2: switch (t.tag) {
            case "left_parenthesis":
            case "left_curly_bracket":
            case "left_square_bracket": {
              stack.push(self.context, frame(self.pending.length, t));
              break w2;
            }
            case "right_curly_bracket": {
              stack.pop(self.context);
              let children = stack.drain(self.pending, f.akr, self.pending.length);
              let r = range(f.lft.range.start, t.range.end);
              stack.push(self.pending, slist(r, children));
              break w2;
            }
            case "right_parenthesis":
            case "tsqrbrakt": {
              stack.push(self.report, error(t.range, "mismatch delimiter"));
              stack.pop(self.context);
              let children = stack.drain(self.pending, f.akr, self.pending.length);
              let r = range(f.lft.range.start, t.range.end);
              stack.push(self.pending, slist(r, children));
              break w2;
            }
            case "text":
            case "integer":
            case "identifier":
            case "hole": {
              stack.push(self.pending, t);
              break w2;
            }
          }
          break w1;
        }
        case "left_square_bracket": {
          w2: switch (t.tag) {
            case "left_parenthesis":
            case "left_curly_bracket":
            case "left_square_bracket": {
              stack.push(self.context, frame(self.pending.length, t));
              break w2;
            }
            case "tsqrbrakt": {
              stack.pop(self.context);
              let children = stack.drain(self.pending, f.akr, self.pending.length);
              let r = range(f.lft.range.start, t.range.end);
              stack.push(self.pending, slist(r, children));
              break w2;
            }
            case "right_parenthesis":
            case "right_curly_bracket": {
              stack.push(self.report, error(t.range, "mismatch delimiter"));
              stack.pop(self.context);
              let children = stack.drain(self.pending, f.akr, self.pending.length);
              let r = range(f.lft.range.start, t.range.end);
              stack.push(self.pending, slist(r, children));
              break w2;
            }
            case "text":
            case "integer":
            case "identifier":
            case "hole": {
              stack.push(self.pending, t);
              break w2;
            }
          }
          break w1;
        }
      }
    },
    parse: (self) => {
      k: while (true) {
        let t = parser.next(self);
        if (t !== none) {
          let f = stack.peek(self.context);
          if (f !== none) {
            parser.matching(self, f, t);
          } else {
            parser.advance(self, t);
          }
          continue k;
        } else {
          break k;
        }
      }
      if (self.context.length === 0) {
        return self.pending;
      } else {
        let dst = new Array(self.pending.length + self.context.length);
        let src = self.pending;
        let i = 0;
        let j = 0;
        let prev = 0;
        for (const f of self.context) {
          let len2 = f.akr - prev;
          stack.push(self.report, error(f.lft.range, "lone delimiter"));
          let val = token.hole(f.lft.range);
          stack.copy_nonoverlapping(src, i, dst, j, len2);
          i += len2;
          j += len2;
          dst[j] = val;
          j++;
          prev = f.akr;
        }
        let len = src.length - i;
        stack.copy_nonoverlapping(src, i, dst, j, len);
        return dst;
      }
    },
    make: (text) => parser(text, 0, 0, 0, [], [], [])
  }
);

// extension.ts
var deactivate = () => {
};
var diagnostic = vscode.languages.createDiagnosticCollection("freya");
var error2 = {
  to_diagnostic: (self) => {
    let {
      range: { start, end },
      message
    } = self;
    const pstart = new vscode.Position(start.line, start.character);
    const pend = new vscode.Position(end.line, end.character);
    const range3 = new vscode.Range(pstart, pend);
    const rslt = new vscode.Diagnostic(
      range3,
      message,
      vscode.DiagnosticSeverity.Error
    );
    return rslt;
  }
};
var check_document = (doc) => {
  if (doc.uri.scheme !== "file") return;
  if (doc.languageId !== "freya") return;
  let text = doc.getText();
  let prs = parser.make(text);
  let sexp = parser.parse(prs);
  diagnostic.set(doc.uri, prs.report.map(error2.to_diagnostic));
};
var activate = (context) => {
  console.log("activate freya language extension");
  let editor = vscode.window.activeTextEditor;
  if (editor !== void 0) {
    check_document(editor.document);
  }
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      check_document(event.document);
    }),
    vscode.languages.registerCompletionItemProvider("freya", {
      provideCompletionItems: (document, position2) => {
        return [
          new vscode.CompletionItem(
            "lambda",
            vscode.CompletionItemKind.Keyword
          )
        ];
      }
    }),
    vscode.languages.registerRenameProvider("freya", {
      provideRenameEdits: (document, position2, newName, token2) => {
        let edit = new vscode.WorkspaceEdit();
        return edit;
      }
    })
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
