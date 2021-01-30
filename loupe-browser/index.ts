import CodeMirror from "codemirror";

const textarea = document.getElementById("code");
if (!textarea) {
  throw Error("code textarea not found");
}
var editor = CodeMirror.fromTextArea(<HTMLTextAreaElement>textarea, {
  lineNumbers: true,
});
editor.replaceRange("hi", { line: 1, ch: 2 }, { line: 1, ch: 5 });

class WebSocketMeta {
  websocket: WebSocket;
  constructor() {
    this.websocket = new WebSocket("ws://localhost:8080/ws");
    this.websocket.onclose = this.onclose;
    this.websocket.onopen = this.onopen;
    this.websocket.onmessage = this.onmessage;
    this.websocket.onerror = this.onerror;
  }
  onclose(e) {
    console.log("Websocket closed", e);
  }
  onmessage(m) {
    console.log(m);
  }
  onerror(e) {
    console.log("websocket error", e);
  }
  onopen() {
    console.log("websocket connected!");
  }
}
new WebSocketMeta();
