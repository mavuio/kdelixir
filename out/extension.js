"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const cp = require("child_process");
function toggle_underscore_prepend(str) {
    if (str.startsWith("_")) {
        return str.substr(1, str.length - 1);
    }
    else {
        return `_${str}`;
    }
}
function add_guards(str) {
    const result = cp.spawnSync("/usr/local/bin/escript", [
        "/Users/manfred/macscripts/kd_expanders/kd_expanders",
        "-c",
        "expand_function",
    ], { input: str });
    return result.stdout.toString();
}
function activate(context) {
    const disposable = vscode.commands.registerCommand("extension.toggleUnderscore", function () {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            editor.edit((editBuilder) => {
                editor.selections.forEach((sel) => {
                    const range = sel.isEmpty
                        ? document.getWordRangeAtPosition(sel.start) || sel
                        : sel;
                    let word = document.getText(range);
                    let toggled = toggle_underscore_prepend(word);
                    editBuilder.replace(range, toggled);
                });
            });
        }
    });
    context.subscriptions.push(disposable);
    const disposable2 = vscode.commands.registerCommand("extension.addGuards", function () {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            editor
                .edit((editBuilder) => {
                editor.selections.forEach((sel) => {
                    const range = document.lineAt(sel.start).range;
                    let line = document.getText(range);
                    let expanded = add_guards(line).trim();
                    if (!expanded.endsWith("do")) {
                        expanded += " do\n\nend";
                    }
                    editBuilder.replace(range, expanded);
                });
            })
                .then((success) => {
                const newSelections = editor.selections.map((sel) => {
                    const lineNr = document.lineAt(sel.start).lineNumber;
                    const nextLineNr = lineNr + 1;
                    const nextPos = new vscode.Position(nextLineNr, 0);
                    return new vscode.Selection(nextPos, nextPos);
                });
                editor.selections = newSelections;
            });
        }
    });
    context.subscriptions.push(disposable2);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map