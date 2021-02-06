import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/go/go";
import { Terminal } from "xterm";
type Range = {
  line: number;
  character: number;
};

enum Time {
  Second = 1000,
  Minute = Second * 60,
}

type TextDocumentChangeEvent = {
  activeEditorChange?: {
    languageId: string;
    text?: string;
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

class Application {
  websocket?: WebSocket;
  editor: CodeMirror.EditorFromTextArea;
  terminal: Terminal;
  constructor() {
    this.terminal = new Terminal();
    const terminalDiv = document.getElementById("terminal");
    if (!terminalDiv) {
      throw Error("terminal textarea not found");
    }
    this.terminal.open(terminalDiv);

    const textarea = document.getElementById("code");
    if (!textarea) {
      throw Error("code textarea not found");
    }
    this.editor = CodeMirror.fromTextArea(<HTMLTextAreaElement>textarea, {
      lineNumbers: true,
      theme: "vscode-dark",
      readOnly: true,
    });
    this.editor.setSize("100%", "100%");
    this.hideCodeMirror();
  }
  toggleTerminal() {
    this.terminal.element?.classList.toggle("hidden");
  }
  hideCodeMirror() {
    this.editor.getWrapperElement().classList.add("hidden");
  }
  toggleCodeMirror() {
    this.editor.getWrapperElement().classList.toggle("hidden");
  }
  hideLoading() {
    document.getElementById("loading")?.classList.add("hidden");
  }
  showLoading() {
    document.getElementById("loading")?.classList.remove("hidden");
  }
  connect() {
    console.log("Attempting to connect to localhost:21456");
    this.websocket = new WebSocket("ws://localhost:21456/ws");
    this.websocket.onclose = this.onclose.bind(this);
    this.websocket.onopen = this.onopen.bind(this);
    this.websocket.onmessage = this.onmessage.bind(this);
    this.websocket.onerror = this.onerror;
  }
  onclose(e) {
    console.log("Websocket closed", e);
  }
  onmessage = (m) => {
    console.log(m.data);
    let event = <TextDocumentChangeEvent>JSON.parse(m.data);

    (event.selections || []).forEach((s) => {
      const lineHeight = 5;
      let t = this.editor.charCoords({ line: s.start.line, ch: 0 }, "local")
        .top;
      let middleHeight = this.editor.getScrollerElement().offsetHeight / 2;
      this.editor.scrollTo(null, t - middleHeight - lineHeight);
      this.editor.setCursor({ line: s.start.line, ch: s.start.character });
    });
    if (event.activeEditorChange) {
      if (event.activeEditorChange.text) {
        this.editor.getDoc().setValue(event.activeEditorChange.text);
      }
      let lang = event.activeEditorChange.languageId;
      if (lang == "typescript") {
        lang = "text/typescript";
      }
      this.editor.setOption("mode", lang);
    }
    (event.contentChanges || []).forEach((cc) => {
      this.editor.replaceRange(
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
  };
  onerror = (e: Event) => {
    this.showLoading();
    // Try and connect again
    setTimeout(() => {
      this.connect();
    }, Time.Second * 2);
  };
  onopen() {
    this.hideLoading();
    console.log("websocket connected!");
  }
}

class DebugPane {
  node: Element;
  constructor(app: Application) {
    let elem = document.getElementsByClassName("debug-pane").item(0);
    if (!elem) {
      throw Error("No debug pane class found");
    }
    this.node = elem;

    this.node.addEventListener("click", (e) => {
      e.preventDefault();
      this.node.querySelector(".links")?.classList.toggle("hidden");
    });
    this.node
      .querySelector(".toggle-editor")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        e.cancelBubble = true;
        app.toggleCodeMirror();
      });
    this.node
      .querySelector(".toggle-terminal")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        e.cancelBubble = true;
        app.toggleTerminal();
      });
  }
}

const app = new Application();
app.connect();
new DebugPane(app);
