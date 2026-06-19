import * as vscode from "vscode";

import { parser, range } from "./parser";
import * as P from "./parser";
export { activate, deactivate };

let deactivate = (): void => {};

let diagnostic = vscode.languages.createDiagnosticCollection("freya");

let quickfixes: Map<string, quickfix[]> = new Map();

type error = P.error;
type quickfix = P.quickfix;

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
  quickfixes.set(doc.uri.toString(), prs.quickfix);
};

let activate = (context: vscode.ExtensionContext): void => {
  console.log("activate freya language extension");

  let editor = vscode.window.activeTextEditor;

  if (editor !== undefined) {
    check_document(editor.document);
  }
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
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
    vscode.languages.registerCodeActionsProvider("freya", {
      provideCodeActions: (
        document,
        range,
        context,
        token,
      ): vscode.CodeAction[] => {
        let qf = quickfixes.get(document.uri.toString()) ?? [];

        let rslt: vscode.CodeAction[] = [];

        for (let q of qf) {
          let qr = new vscode.Range(
            new vscode.Position(q.range.start.line, q.range.start.character),
            new vscode.Position(q.range.end.line, q.range.end.character),
          );
          if (qr.contains(range)) {
            let edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, qr, q.replacement);
            let ca = new vscode.CodeAction(
              q.title,
              vscode.CodeActionKind.QuickFix,
            );
            ca.edit = edit;
            rslt.push(ca);
          }
        }

        return rslt;
      },
    }),
  );
};
