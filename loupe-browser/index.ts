import CodeMirror from "codemirror";
import "codemirror/addon/scroll/simplescrollbars";
import "./syntax";
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
  terminal: {
    id: number;
    data?: string;
    resize?: { columns: number; rows: number };
    exit?: boolean;
    stdin?: boolean;
  };
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

function debounce(func: () => void, wait: number, immediate?: boolean) {
  var timeout: number | undefined;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = undefined;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

class Application {
  websocket?: WebSocket;
  editor: CodeMirror.EditorFromTextArea;
  terminal: Terminal;
  languageId?: string;
  constructor() {
    this.terminal = new Terminal({
      theme: {
        background: "#1e1e1e",
      },
    });
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
      scrollbarStyle: "null",
    });
  }

  _removeClass = (e: Element | null, className: string) => {
    e?.classList.remove(className);
  };
  _addClass = (e: Element | null, className: string) => {
    e?.classList.add(className);
  };
  _toggleHidden = (e: Element | null, hide?: boolean) => {
    e?.classList.toggle("hidden");
  };
  _hide = (e: Element | null) => {
    e?.classList.add("hidden");
  };
  _show = (e: Element | null) => {
    e?.classList.remove("hidden");
  };
  get editorElement() {
    return this.editor.getWrapperElement();
  }
  get loadingElement() {
    return document.getElementById("loading");
  }
  get terminalElement() {
    return this.terminal.element || null;
  }
  get containerElement() {
    return document.querySelector(".container");
  }
  fullscreenMode = () => {
    this._addClass(this.containerElement, "fullscreen");
    this._removeClass(this.containerElement, "resizeContainer");
  };
  resizeMode = () => {
    this._removeClass(this.containerElement, "fullscreen");
    this._addClass(this.containerElement, "resizeContainer");
  };
  showCodeMirror = () => {
    this._hide(this.loadingElement);
    this._show(this.editorElement);
    this._hide(this.terminalElement);
    this.fullscreenMode();
  };
  showTerminal = () => {
    this._hide(this.loadingElement);
    this._hide(this.editorElement);
    this._show(this.terminalElement);
    this.resizeMode();
  };
  showLoading = () => {
    this._hide(this.editorElement);
    this._hide(this.terminalElement);
    this._show(this.loadingElement);
    this.resizeMode();
  };
  connect() {
    console.log("Attempting to connect to localhost:21456");
    this.websocket = new WebSocket("ws://localhost:21456/ws");
    this.websocket.onclose = this.onclose.bind(this);
    this.websocket.onopen = this.onopen.bind(this);
    this.websocket.onmessage = this.onmessage.bind(this);
    this.websocket.onerror = this.onerror;
  }
  onclose = (e) => {
    console.log("Websocket closed", e);
    this.editor.getDoc().setValue("");
    this.showLoading();
    // Try and connect again
    setTimeout(() => {
      this.connect();
    }, Time.Second * 2);
  };
  setSyntaxHighlighting = (lang: string) => {
    if (lang == "typescript") {
      lang = "text/typescript";
    }
    switch (lang) {
      case "scss":
        lang = "text/x-scss";
      case "typescript":
        lang = "text/typescript";
      case "json":
        lang = "application/json";
      case "jsonc":
        lang = "application/json";
    }
    if (lang !== this.languageId) {
      this.editor.setOption("mode", lang);
    }
    this.languageId = lang;
  };
  onmessage = (m) => {
    console.log(m.data);
    let event = <TextDocumentChangeEvent>JSON.parse(m.data);

    let fileChanged = false;
    if (event.activeEditorChange) {
      if (event.activeEditorChange.text !== undefined) {
        this.editor.getDoc().setValue(event.activeEditorChange.text);
        fileChanged = true;
      }
      this.setSyntaxHighlighting(event.activeEditorChange.languageId);
    }
    if (event.terminal) {
      if (event.terminal.data) this.terminal.write(event.terminal.data);
      if (event.terminal.resize)
        this.terminal.resize(
          event.terminal.resize.columns,
          event.terminal.resize.rows
        );
      if (event.terminal.exit) this.terminal.clear();
      if (event.terminal.stdin) {
        this.showTerminal();
      }
    }
    if (event.selections && event.selections.length > 0) {
      this.showCodeMirror();
      // ignore multi-cursor edits for now
      const s = event.selections[0];
      const lineHeight = 5;
      let t = this.editor.charCoords({ line: s.start.line, ch: 0 }, "local")
        .top;
      let middleHeight = this.editor.getScrollerElement().offsetHeight / 2;
      // this.editor.scrollTo({ left: null, top: t - middleHeight - lineHeight, behavior: "smooth ");
      this.editor.setCursor(
        { line: s.start.line, ch: s.start.character },
        undefined,
        { scroll: false }
      );

      // Set all of the selections, the first selection (the one we use for the
      // cursor) will be the primary. The rest are good for multi-select.
      //
      // when doing multi-select vscode will follow the last selection, maybe
      // make that primary?
      this.editor.setSelections(
        event.selections?.map((s) => ({
          anchor: { line: s.start.line, ch: s.start.character },
          head: { line: s.end.line, ch: s.end.character },
        }))
      );

      document.querySelector(".CodeMirror-scroll")?.scrollTo({
        top: t - middleHeight - lineHeight,
        left: undefined,
        // jump right to the line when changing files
        behavior: fileChanged ? undefined : "smooth",
      });

      // debounce(() => {
      // }, 10)()
    }
    if (event.document) {
      this.setSyntaxHighlighting(event.document.languageId);
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
    console.log("ws error", e);
  };
  onopen() {
    console.log("websocket connected!");
  }
}

const app = new Application();
app.connect();
