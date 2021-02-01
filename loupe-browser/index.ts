import CodeMirror from "codemirror";
const textarea = document.getElementById("code");
if (!textarea) {
  throw Error("code textarea not found");
}
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/go/go";
var editor = CodeMirror.fromTextArea(<HTMLTextAreaElement>textarea, {
  lineNumbers: true,
  theme: "vscode-dark",
  readOnly: true,
});
editor.setSize("100%", "100%");

// [{"start":{"line":0,"character":5},"end":{"line":0,"character":5},"active":{"line":0,"character":5},"anchor":{"line":0,"character":5}}]

type Range = {
  line: number;
  character: number;
};
type TextDocumentChangeEvent = {
  activeEditorChange?: {
    languageId: string;
    text: string;
  };
  selections?: Array<{
    start: Range;
    end: Range;
    active: Range;
    anchor: Range;
  }>;
  document?: {
    uri: {
      $mid: number;
      fsPath: string;
      external: string;
      path: string;
      scheme: string;
    };
    fileName: string;
    isUntitled: boolean;
    languageId: string;
    version: number;
    isClosed: boolean;
    isDirty: boolean;
    eol: number;
    lineCount: number;
  };
  contentChanges?: Array<{
    range: [Range, Range];
    rangeOffset: number;
    rangeLength: number;
    text: string;
  }>;
};

class WebSocketMeta {
  websocket: WebSocket;
  constructor() {
    this.websocket = new WebSocket("ws://localhost:21456/ws");
    this.websocket.onclose = this.onclose;
    this.websocket.onopen = this.onopen;
    this.websocket.onmessage = this.onmessage;
    this.websocket.onerror = this.onerror;
  }
  onclose(e) {
    console.log("Websocket closed", e);
  }
  onmessage(m) {
    console.log(m.data);
    let event = <TextDocumentChangeEvent>JSON.parse(m.data);

    (event.selections || []).forEach((s) => {
      const lineHeight = 5;
      let t = editor.charCoords({ line: s.start.line, ch: 0 }, "local").top;
      let middleHeight = editor.getScrollerElement().offsetHeight / 2;
      editor.scrollTo(null, t - middleHeight - lineHeight);
    });
    if (event.activeEditorChange) {
      editor.getDoc().setValue(event.activeEditorChange.text);
      let lang = event.activeEditorChange.languageId;
      if (lang == "typescript") {
        lang = "text/typescript";
      }
      editor.setOption("mode", lang);
    }
    (event.contentChanges || []).forEach((cc) => {
      editor.replaceRange(
        cc.text,
        {
          line: cc.range[0].line,
          ch: cc.range[0].character,
        },
        {
          line: cc.range[1].line,
          ch: cc.range[1].character,
        }
      );
    });
  }
  onerror(e) {
    console.log("websocket error", e);
  }
  onopen() {
    console.log("websocket connected!");
  }
}
new WebSocketMeta();
