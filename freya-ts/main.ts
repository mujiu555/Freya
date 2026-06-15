import { parser } from "./parser";
import * as fs from "node:fs";

let main = () => {
  let text = fs.readFileSync("playground/main.fry", { encoding: "utf-8" });
  let prs = parser.make(text);
  let sexp = parser.parse(prs);
  console.log(prs.report);
  console.log(JSON.stringify(sexp));
}
;
main();