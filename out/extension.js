"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.activate = void 0;
const vscode = require("vscode");
const cp = require("child_process");

const fs = require('fs').promises;

async function getFirstLine(filePath) {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return (fileContent.match(/(^.*)/) || [])[1] || '';
}

function toggle_underscore_prepend(str) {
    if (str.startsWith("_")) {
        return str.substr(1, str.length - 1);
    } else {
        return `_${str}`;
    }
}

function add_guards(str) {
    const result = cp.spawnSync("/usr/local/bin/escript", [
        "/Users/manfred/macscripts/kd_expanders/kd_expanders",
        "-c",
        "expand_function",
    ], {
        input: str
    });
    return result.stdout.toString();
}
async function activate(context) {
    const disposable = vscode.commands.registerCommand("extension.toggleUnderscore", function () {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            editor.edit((editBuilder) => {
                editor.selections.forEach((sel) => {
                    const range = sel.isEmpty ?
                        document.getWordRangeAtPosition(sel.start) || sel :
                        sel;
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
    const disposable3 = vscode.commands.registerCommand("extension.copyModuleName", async function (clicked_file, selected_files) {


        let file = null
        if (clicked_file) {
            file = clicked_file.fsPath
        } else {
            file = vscode.window.activeTextEditor.document.fileName
        }

        console.log('#log 7784', file);

        let line= await getFirstLine(file)

        var re = /defmodule ([a-zA-Z0-9.]+) do/g;
        var moduleName = re.exec(line)[1];

        console.log('#log 3043', moduleName,line);
        if (moduleName) {
            await vscode.env.clipboard.writeText(moduleName);
        }



    });
    context.subscriptions.push(disposable3);


}
exports.activate = activate;
//# sourceMappingURL=extension.js.map
