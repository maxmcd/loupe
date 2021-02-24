// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as WebSocket from "ws";
import * as http from "http";
import * as url from "url";
import * as net from "net";
class WebSocketServer {
  wssClients?: WebSocket.Server;
  wssTerminal?: WebSocket.Server;
  server?: http.Server;
  sessions: Array<WebSocket> = [];
  running: boolean = false;
  disposables: Array<vscode.Disposable> = [];
  document?: string;
  constructor() {}
  startListeners() {
    this.disposables.push(
      vscode.window.onDidChangeTextEditorSelection((e) => {
        this.sendMessage({ selections: e.selections });
      })
    );
    this.disposables.push(
      vscode.window.onDidChangeTextEditorOptions((e) => {
        console.log("onDidChangeTextEditorOptions", e);
      })
    );
    this.disposables.push(
      vscode.window.onDidChangeActiveColorTheme((e) => {
        console.log("onDidChangeActiveColorTheme", e);
      })
    );
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor((e) => {
        // TODO: e can be undefined if focus changes to nothing, what do then?
        // vscode.window.activeTextEditor?.selection.
        this.sendDocument(e);
      })
    );
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        // ignore changes that don't happen in the active window
        if (this.document === e.document.uri.fsPath) {
          this.sendMessage(e);
        }
      })
    );
  }
  stop() {
    this.running = false;
    this.server?.close();
    // TODO: Do we need to close here?
    this.wssClients?.close();
    this.wssTerminal?.close();
    this.sessions = [];
    this.disposables.forEach((e) => e.dispose());
    this.disposables = [];
    console.log("server stopped");
  }
  start() {
    this.server = http.createServer();
    this.wssTerminal = new WebSocket.Server({ noServer: true });
    this.wssClients = new WebSocket.Server({ noServer: true });
    this.wssClients.on("connection", this.editorConnection);
    this.wssTerminal.on("connection", this.terminalConnection);
    this.server.on("upgrade", this.serverUpgrade);
    this.server.listen(21456);
    this.running = true;
    this.startListeners();
    console.log("loupe server started");
  }

  serverUpgrade = (
    request: http.IncomingMessage,
    socket: net.Socket,
    head: Buffer
  ) => {
    if (request.url === "/ws") {
      this.wssClients?.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        this.wssClients?.emit("connection", ws, request);
      });
    } else if (request.url === "/terminal") {
      this.wssTerminal?.handleUpgrade(
        request,
        socket,
        head,
        (ws: WebSocket) => {
          this.wssTerminal?.emit("connection", ws, request);
        }
      );
    }
  };
  editorConnection = (ws: WebSocket) => {
    this.sessions.push(ws);
    this.sendDocument(vscode.window.activeTextEditor, ws);
  };
  terminalConnection = (ws: WebSocket) => {
    ws.onmessage = (msg) => {
      const payload = JSON.parse(msg.data.toString());
      this.sendMessage({ terminal: payload });
    };
    ws.onclose = (msg) => {
      this.sendMessage({ terminal: { exit: true } });
    };
  };
  sendDocument(e?: vscode.TextEditor, session?: WebSocket) {
    this.document = e?.document.uri.fsPath;
    if (!e) {
      return;
    }
    let msg = {
      activeEditorChange: {
        languageId: e.document.languageId,
        text: e.document.getText(),
      },
      selections: vscode.window.activeTextEditor?.selections,
    };
    this.sendMessage(msg, session);
  }
  sendPayload(payload: any, session?: WebSocket) {
    // either send to all active sessions, or send to the passed session
    (session ? [session] : this.sessions).forEach((session) => {
      session.send(payload);
    });
  }
  sendMessage(e: any, session?: WebSocket) {
    const payload = JSON.stringify(e);
    console.log("sendMessage", payload);
    this.sendPayload(payload, session);
  }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({
  subscriptions,
  globalState,
}: vscode.ExtensionContext) {
  // let disposable = vscode.commands.registerCommand("loupe.helloWorld", () => {
  //   // The code you place here will be executed every time your command is executed
  //   // Display a message box to the user
  //   vscode.window.showInformationMessage("Hello World from loupe!");
  // });

  console.log("Activated loupe", globalState.get("running"));
  const server = new WebSocketServer();
  const commandID = "loupe.startStopLoupe";

  subscriptions.push(
    vscode.commands.registerCommand(commandID, () => {
      if (server.running) {
        vscode.window.showInformationMessage(`Stopping loupe session`);
        globalState.update("running", false);
        server.stop();
      } else {
        vscode.window.showInformationMessage(`Starting loupe session`);
        globalState.update("running", true);
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
export function deactivate() {}
