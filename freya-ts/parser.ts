export { parser, range, position };
export type { error };
/** 32-bits signed integer */
type int = number;

let int = {
  parse: (self: str): int => parseInt(self),
};

/** UTF-16 string */
type str = string;
let str = {
  code_unit_at: (self: str, n: int): int => self.charCodeAt(n),
  slice: (self: str, s: int, e: int): str => self.slice(s, e),
};

type none = undefined;
let none = undefined;

type option<a> = a | none;

type stack<a> = a[];
let stack = {
  truncate: <a>(self: stack<a>, n: int): void => {
    self.length = n;
  },
  push: <a>(self: stack<a>, v: a): void => {
    self.push(v);
  },
  pop: <a>(self: stack<a>): option<a> => self.pop(),
  peek: <a>(self: stack<a>): option<a> =>
    self.length === 0 ? none : self[self.length - 1],
  drain: <a>(self: stack<a>, s: int, e: int): stack<a> => self.splice(s, e - s),
  copy_nonoverlapping: <a>(
    src: stack<a>,
    sofs: int,
    dst: stack<a>,
    dofs: int,
    len: int,
  ): void => {
    for (let i = sofs, j = dofs; j < dofs + len; i++, j++) {
      dst[j] = src[i];
    }
  },
};

type position = { line: int; character: int };
let position = (line: int, character: int) => ({ line, character });
type range = { start: position; end: position };
let range = (start: position, end: position) => ({ start, end });

type atom = token.text | token.integer | token.identifier | token.hole;
type left_token =
  | token.left_parenthesis
  | token.left_curly_bracket
  | token.left_square_bracket;
type token =
  | token.left_parenthesis
  | token.left_curly_bracket
  | token.left_square_bracket
  | token.right_parenthesis
  | token.right_curly_bracket
  | token.right_square_bracket
  | token.text
  | token.integer
  | token.identifier
  | token.hole;

// prettier-ignore
export namespace token {
  export type left_parenthesis = { tag: "left_parenthesis"; range: range };
  export type right_parenthesis = { tag: "right_parenthesis"; range: range };
  export type left_curly_bracket = { tag: "left_curly_bracket"; range: range };
  export type right_curly_bracket = { tag: "right_curly_bracket"; range: range; };
  export type left_square_bracket = { tag: "left_square_bracket"; range: range; };
  export type right_square_bracket = { tag: "tsqrbrakt"; range: range };
  export type text = { tag: "text"; range: range; text: str };
  export type integer = { tag: "integer"; range: range; data: int };
  export type identifier = { tag: "identifier"; range: range; text: str };
  export type hole = { tag: "hole"; range: range };
}

// prettier-ignore
let token = {
  left_parenthesis: (range: range): token.left_parenthesis => ({ tag: "left_parenthesis", range, }),
  right_parenthesis: (range: range): token.right_parenthesis => ({ tag: "right_parenthesis", range, }),
  left_curly_bracket: (range: range): token.right_curly_bracket => ({ tag: "right_curly_bracket", range, }),
  right_curly_bracket: (range: range): token.left_curly_bracket => ({ tag: "left_curly_bracket", range, }),
  left_square_bracket: (range: range): token.left_square_bracket => ({ tag: "left_square_bracket", range, }),
  right_square_bracket: (range: range): token.right_square_bracket => ({ tag: "tsqrbrakt", range, }),
  text: (range: range, text: str): token.text => ({ tag: "text", range, text }),
  integer: (range: range, data: int): token.integer => ({ tag: "integer", range, data, }),
  identifier: (range: range, text: str): token.identifier => ({ tag: "identifier", range, text, }),
  hole: (range: range): token.hole => ({ tag: "hole", range }),
};

type expr = atom | slist;

type slist = { tag: "slist"; range: range; children: expr[] };
let slist = (range: range, children: expr[]): slist => ({
  tag: "slist",
  range,
  children,
});

type frame = { akr: int; lft: left_token };
let frame = (akr: int, lft: left_token): frame => ({ akr, lft });

type error = { range: range; message: str };
let error = (range: range, message: str) => ({ range, message });

type parser = {
  text: str;
  line: int;
  character: int;
  index: int;
  pending: stack<expr>;
  context: stack<frame>;
  report: error[];
};

let parser = Object.assign(
  // prettier-ignore
  (text: str, ln: int, ch: int, ix: int, pen: stack<expr>, ctx: stack<frame>, rpt: error[], ): parser => ({ text, line: ln, character: ch, index: ix, pending: pen, context: ctx, report: rpt, }),
  {
    // prettier-ignore
    // next token 
    next : (self: parser): option<token> => {
      let pln = self.line; let pch = self.character; let pix = self.index;
      let ln = pln; let ch = pch; let ix = pix;
      k1: while (ix < self.text.length) {
        let cu = str.code_unit_at(self.text, ix);
        switch (cu) {
          case 40: { // '('
            ch++; ix++;
            self.line = ln; self.character = ch; self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.left_parenthesis(r);
          }
          case 41: { // ')'
            ch++; ix++;
            self.line = ln; self.character = ch; self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.right_parenthesis(r);
          }
          case 91: { // '['
            ch++; ix++;
            self.line = ln; self.character = ch; self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.left_square_bracket(r);
          }
          case 93: { // ']'
            ch++; ix++;
            self.line = ln; self.character = ch; self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.right_square_bracket(r);
          }
          case 123: { // '{'
            ch++; ix++;
            self.line = ln; self.character = ch; self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.right_curly_bracket(r);
          }
          case 125: { // '}'
            ch++; ix++;
            self.line = ln; self.character = ch; self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.left_curly_bracket(r);
          }
          case 95: { // '_'
            ch++; ix++;
            self.line = ln; self.character = ch; self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.hole(r);
          }
          case 59: { // ';'
            ch++; ix++;
            k2: while (ix < self.text.length) {
              let cu = str.code_unit_at(self.text, ix);
              if (cu !== 10) {
                ch++; ix++;
                continue k2;
              } else {
                break k2;
              }
            }
            self.line = ln; self.character = ch; self.index = ix;
            pln = ln; pch = ch; pix = ix;
            continue k1;
          }
          case 34: { // '"'
            let s = ix; ch++; ix++;
            k2: while (ix < self.text.length) {
              let cu = str.code_unit_at(self.text, ix);
              if (cu !== 34 && cu !== 10) {
                ch++; ix++;
                continue k2;
              } else {
                ch++; ix++;
                break k2;
              }
            }
            let e = ix;
            let span = str.slice(self.text, s, e);
            self.line = ln; self.character = ch; self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.text(r, span);
          }
          case 10: { // LF
            ln++; ch = 0; ix++;
            self.line = ln; self.character = ch; self.index = ix;
            pln = ln; pch = ch; pix = ix;
            continue k1;
          }
          // ' ' | HT | CR | VT | FF
          case 9: case 11: case 12: case 13: case 32: {
            ch++; ix++;
            k2: while (ix < self.text.length) {
              let cu = str.code_unit_at(self.text, ix);
              if ((11 <= cu && cu <= 13) || cu === 9 || cu === 32) {
                ch++; ix++;
                continue k2;
              } else {
                break k2;
              }
            }
            self.line = ln; self.character = ch; self.index = ix;
            pln = ln; pch = ch; pix = ix;
            continue k1;
          }
          //  'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
          case 97: case 98: case 99: case 100: case 101: case 102: case 103: case 104: case 105: case 106: case 107: case 108: case 109: case 110: case 111: case 112: case 113: case 114: case 115: case 116: case 117: case 118: case 119: case 120: case 121: case 122: {
            let s = ix; ch++; ix++;
            k2: while (ix < self.text.length) {
              let cu = str.code_unit_at(self.text, ix);
              if ((97 <= cu && cu <= 122) || (48 <= cu && cu <= 57) || cu === 45) {
                ch++; ix++;
                continue k2;
              } else {
                break k2;
              }
            }
            let e = ix;
            let span = str.slice(self.text, s, e);
            self.line = ln; self.character = ch; self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.identifier(r, span);
          }
          // '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
          case 48: case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: {
            let s = ix; ch++; ix++;
            while (ix < self.text.length) {
              let cu = str.code_unit_at(self.text, ix);
              if (48 <= cu && cu <= 57) {
                ch++; ix++;
                continue;
              } else {
                break;
              }
            }
            let e = ix; let span = str.slice(self.text, s, e);
            self.line = ln; self.character = ch; self.index = ix;
            let r = range(position(pln, pch), position(ln, ch));
            return token.integer(r, int.parse(span));
          }
          default: {
            ch++; ix++;
            k2: while (ix < self.text.length) {
              let cu = str.code_unit_at(self.text, ix);
              switch (cu) {
                case 59: // ';'
                case 34: // '"'
                case 40: case 41:   // '(' | ')'
                case 91: case 93:   // '[' | ']'
                case 123: case 125: // '{' | '}'
                case 95: // '_'
                case 10: // LF 
                case 9: case 11: case 12: case 13: case 32: // HT | VT | FF | CR | ' '
                //  'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
                case 97: case 98: case 99: case 100: case 101: case 102: case 103: case 104: case 105: case 106: case 107: case 108: case 109: case 110: case 111: case 112: case 113: case 114: case 115: case 116: case 117: case 118: case 119: case 120: case 121: case 122:
                // '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
                case 48: case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: {
                  break k2;
                }
                default: {
                  ch++; ix++;
                  continue k2;
                }
              }
            }
            self.line = ln; self.character = ch; self.index = ix;
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
    advance: (self: parser, t: token): void => {
      w1: switch (t.tag) {
        case "left_parenthesis": case "left_curly_bracket": case "left_square_bracket": { // nest
          stack.push(self.context, frame(self.pending.length, t));
          break w1;
        }
        case "right_parenthesis": case "right_curly_bracket": case "tsqrbrakt": { // retain as hole
          stack.push(self.report, error(t.range, "lone delimiter"));
          stack.push(self.pending, token.hole(t.range));
          break w1;
        }
        case "text": case "integer": case "identifier": case "hole": { // shift
          stack.push(self.pending, t);
          break w1;
        }
      }
    },
    // prettier-ignore
    // parse token with context 
    matching : (self: parser, f: frame, t: token): void => {
      // rule 
      // delimiter matching => reduce 
      // mismatch  mismatch => reduce and report 
      // others             => shift 
      //
      // reference: 
      // - 容错解析器 – 算法实现 - 猗露的文章 - 知乎 https://zhuanlan.zhihu.com/p/2041276687695009235
      // - 用 MoonBit 实现错误恢复的解析器 - 猗露的文章 - 知乎 https://zhuanlan.zhihu.com/p/2025939326198924015
      // - 错误恢复解析器 - Rust - 猗露的文章 - 知乎 https://zhuanlan.zhihu.com/p/2025943287572243410
      // - LSP diagnostic 设计 - 猗露的文章 - 知乎 https://zhuanlan.zhihu.com/p/2033406683414840475
      // - 解析器技术选型 – 工程权衡 - 猗露的文章 - 知乎 https://zhuanlan.zhihu.com/p/2041610268736837328
      // - error recovery lexer - 工程权衡 - 猗露的文章 - 知乎 https://zhuanlan.zhihu.com/p/2031765404071228614
      w1: switch (f.lft.tag) {
        case "left_parenthesis": {
          w2: switch (t.tag) {
            case "left_parenthesis": case "left_curly_bracket": case "left_square_bracket": { // nest
              stack.push(self.context, frame(self.pending.length, t));
              break w2;
            }
            case "right_parenthesis": { // matching
              stack.pop(self.context); // consume frame
              let children = stack.drain(self.pending, f.akr, self.pending.length);
              let r = range(f.lft.range.start, t.range.end);
              stack.push(self.pending, slist(r, children));
              break w2;
            }
            case "right_curly_bracket": case "tsqrbrakt": { // mismatch
              stack.push(self.report, error(t.range, "mismatch delimiter"));
              stack.pop(self.context); // consume frame
              let children = stack.drain(self.pending, f.akr, self.pending.length);
              let r = range(f.lft.range.start, t.range.end);
              stack.push(self.pending, slist(r, children));
              break w2;
            }
            case "text": case "integer": case "identifier": case "hole": { // shift
              stack.push(self.pending, t);
              break w2;
            }
          }
          break w1;
        }
        case "left_curly_bracket": {
          w2: switch (t.tag) {
            case "left_parenthesis": case "left_curly_bracket": case "left_square_bracket": { // nest
              stack.push(self.context, frame(self.pending.length, t));
              break w2;
            }
            case "right_curly_bracket": { // matching
              stack.pop(self.context); // consume frame
              let children = stack.drain(self.pending, f.akr, self.pending.length);
              let r = range(f.lft.range.start, t.range.end);
              stack.push(self.pending, slist(r, children));
              break w2;
            }
            case "right_parenthesis": case "tsqrbrakt": { // mismatch
              stack.push(self.report, error(t.range, "mismatch delimiter"));
              stack.pop(self.context); // consume frame
              let children = stack.drain(self.pending, f.akr, self.pending.length);
              let r = range(f.lft.range.start, t.range.end);
              stack.push(self.pending, slist(r, children));
              break w2;
            }
            case "text": case "integer": case "identifier": case "hole": { // shift
              stack.push(self.pending, t);
              break w2;
            }
          }
          break w1;
        }
        case "left_square_bracket": {
          w2: switch (t.tag) {
            case "left_parenthesis": case "left_curly_bracket": case "left_square_bracket": { // nest
              stack.push(self.context, frame(self.pending.length, t));
              break w2;
            }
            case "tsqrbrakt": { // matching
              stack.pop(self.context); // consume frame
              let children = stack.drain(self.pending, f.akr, self.pending.length);
              let r = range(f.lft.range.start, t.range.end);
              stack.push(self.pending, slist(r, children));
              break w2;
            }
            case "right_parenthesis": case "right_curly_bracket": { // mismatch
              stack.push(self.report, error(t.range, "mismatch delimiter"));
              stack.pop(self.context); // consume frame
              let children = stack.drain(self.pending, f.akr, self.pending.length);
              let r = range(f.lft.range.start, t.range.end);
              stack.push(self.pending, slist(r, children));
              break w2;
            }
            case "text": case "integer": case "identifier": case "hole": { // shift
              stack.push(self.pending, t);
              break w2;
            }
          }

          break w1;
        }
      }
    },
    parse: (self: parser): expr[] => {
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
        let dst: expr[] = new Array(self.pending.length + self.context.length);
        let src = self.pending;
        let i = 0;
        let j = 0;
        let prev = 0;
        for (const f of self.context) {
          let len = f.akr - prev;
          stack.push(self.report, error(f.lft.range, "lone delimiter"));
          let val = token.hole(f.lft.range);
          stack.copy_nonoverlapping(src, i, dst, j, len);
          i += len;
          j += len;
          dst[j] = val;
          j++;
          prev = f.akr;
        }
        let len = src.length - i;
        stack.copy_nonoverlapping(src, i, dst, j, len);
        return dst;
      }
    },
    make: (text: str): parser => parser(text, 0, 0, 0, [], [], []),
  },
);
