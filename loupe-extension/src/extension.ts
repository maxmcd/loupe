// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as child_process from "child_process";
import * as net from "net";
import * as os from "os";
import * as WebSocket from "ws";

class WebSocketServer {
  wss?: WebSocket.Server;
  sessions: Array<WebSocket> = [];
  running: boolean = false;
  disposables: Array<vscode.Disposable> = [];
  constructor() { }
  startListeners() {
    this.disposables.push(
      vscode.window.onDidChangeTextEditorSelection((e) => {
        this.sendMessage({ selections: e.selections });
      })
    );
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor((e) => {
        // TODO: e can be undefined if focus changes to nothing, what do then?
        this.sendDocument(e);
      })
    );
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        this.sendMessage(e);
      })
    );
  }
  stop() {
    this.running = false;
    this.wss?.close();
    this.sessions = [];
    this.disposables.forEach((e) => e.dispose());
    this.disposables = [];
    console.log("server stopped")
  }
  start(): WebSocket.Server {
    this.wss = new WebSocket.Server({
      port: 21456,
    });
    this.running = true;
    this.wss.on("connection", this.connection.bind(this));
    this.startListeners();
    console.log("loupe server started")
    return this.wss;
  }
  connection(ws: WebSocket) {
    this.sessions.push(ws);
    this.sendDocument(vscode.window.activeTextEditor, ws);
  }
  sendDocument(e?: vscode.TextEditor, session?: WebSocket) {
    if (!e) {
      return;
    }
    this.sendMessage(
      {
        activeEditorChange: {
          languageId: e.document.languageId,
          text: e.document.getText(),
        },
      },
      session
    );
  }
  sendMessage(e: any, session?: WebSocket) {
    console.log(e, this.sessions);
    const payload = JSON.stringify(e);
    // either send to all active sessions, or send to the passed session
    (session ? [session] : this.sessions).forEach((session) => {
      console.log(session);
      session.send(payload);
    });
  }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {
  // let disposable = vscode.commands.registerCommand("loupe.helloWorld", () => {
  //   // The code you place here will be executed every time your command is executed
  //   // Display a message box to the user
  //   vscode.window.showInformationMessage("Hello World from loupe!");
  // });
  console.log("Activated loupe");
  const server = new WebSocketServer();
  const commandID = "loupe.startStopLoupe";

  subscriptions.push(
    vscode.commands.registerCommand(commandID, () => {
      if (server.running) {
        vscode.window.showInformationMessage(`Stopping loupe session`);
        server.stop();
      } else {
        vscode.window.showInformationMessage(`Starting loupe session`);
        server.start();
      }
    })
  );
  const myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  myStatusBarItem.text = "Loupe";
  myStatusBarItem.show();
  myStatusBarItem.command = commandID;
  subscriptions.push(myStatusBarItem);

  // subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
