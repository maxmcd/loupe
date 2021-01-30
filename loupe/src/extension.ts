// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as child_process from "child_process";
import * as os from "os";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "loupe" is now active!');
  var textEditor = <vscode.TextEditor>vscode.window.activeTextEditor;
  var firstLine = textEditor.document.lineAt(0);
  var lastLine = textEditor.document.lineAt(textEditor.document.lineCount - 1);
  var textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
  console.log(textRange);
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const homedir = os.homedir();
  console.log(homedir);
  var spawn = child_process.spawn;
  var child = spawn("loupe-go");
  //   child.stdin.setDefaultEncoding("utf-8");

  child.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });
  child.on("close", (e) => {
    console.log("close", e);
  });

  child.on("exit", (code) => {
    console.log(`child process exited with code ${code}`);
  });
  let disposable = vscode.commands.registerCommand("loupe.helloWorld", () => {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from loupe!");
  });

  vscode.workspace.onDidChangeTextDocument((e) => {
    console.log(e);
    try {
      child.stdin.write(JSON.stringify(e) + "\n");
    } catch (error) {}
  });
  //   child.stdin.end();

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
