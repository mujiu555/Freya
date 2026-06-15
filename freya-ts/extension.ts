import * as vscode from "vscode";

import { parser, range } from "./parser";
export { activate, deactivate };

let deactivate = (): void => {};

let diagnostic = vscode.languages.createDiagnosticCollection("freya");

type error = { range: range; message: string };

let error = {
  to_diagnostic: (self: error) => {
    let {
      range: { start, end },
      message,
    } = self;
    const pstart = new vscode.Position(start.line, start.character);
    const pend = new vscode.Position(end.line, end.character);
    const range = new vscode.Range(pstart, pend);
    const rslt = new vscode.Diagnostic(
      range,
      message,
      vscode.DiagnosticSeverity.Error,
    );
    return rslt;
  },
};

let check_document = (doc: vscode.TextDocument): void => {
  if (doc.uri.scheme !== "file") return;
  if (doc.languageId !== "freya") return;
  let text = doc.getText();
  let prs = parser.make(text);
  let sexp = parser.parse(prs);

  diagnostic.set(doc.uri, prs.report.map(error.to_diagnostic));
};

let activate = (context: vscode.ExtensionContext): void => {
  console.log("activate freya language extension");

  let editor = vscode.window.activeTextEditor;

  if (editor !== undefined) {
    check_document(editor.document);
  }
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      check_document(event.document);
    }),
    vscode.languages.registerCompletionItemProvider("freya", {
      provideCompletionItems: (document, position): vscode.CompletionItem[] => {
        // please implementation it.
        return [
          new vscode.CompletionItem(
            "lambda",
            vscode.CompletionItemKind.Keyword,
          ),
        ];
      },
    }),
    vscode.languages.registerRenameProvider("freya", {
      provideRenameEdits: (
        document,
        position,
        newName,
        token,
      ): vscode.WorkspaceEdit => {
        let edit = new vscode.WorkspaceEdit();
        // using edit.replace() to modify source code. 
        return edit;
      },
    }),
  );
};
