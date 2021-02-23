import CodeMirror from "codemirror";
import "codemirror/mode/apl/apl";
import "codemirror/mode/asciiarmor/asciiarmor";
import "codemirror/mode/asn.1/asn.1";
import "codemirror/mode/asterisk/asterisk";
import "codemirror/mode/brainfuck/brainfuck";
import "codemirror/mode/clike/clike";
import "codemirror/mode/clojure/clojure";
import "codemirror/mode/cmake/cmake";
import "codemirror/mode/cobol/cobol";
import "codemirror/mode/coffeescript/coffeescript";
import "codemirror/mode/commonlisp/commonlisp";
import "codemirror/mode/crystal/crystal";
import "codemirror/mode/css/css";
import "codemirror/mode/cypher/cypher";
import "codemirror/mode/d/d";
import "codemirror/mode/dart/dart";
import "codemirror/mode/diff/diff";
import "codemirror/mode/django/django";
import "codemirror/mode/dockerfile/dockerfile";
import "codemirror/mode/dtd/dtd";
import "codemirror/mode/dylan/dylan";
import "codemirror/mode/ebnf/ebnf";
import "codemirror/mode/ecl/ecl";
import "codemirror/mode/eiffel/eiffel";
import "codemirror/mode/elm/elm";
import "codemirror/mode/erlang/erlang";
import "codemirror/mode/factor/factor";
import "codemirror/mode/fcl/fcl";
import "codemirror/mode/forth/forth";
import "codemirror/mode/fortran/fortran";
import "codemirror/mode/gas/gas";
import "codemirror/mode/gfm/gfm";
import "codemirror/mode/gherkin/gherkin";
import "codemirror/mode/go/go";
import "codemirror/mode/groovy/groovy";
import "codemirror/mode/haml/haml";
import "codemirror/mode/handlebars/handlebars";
import "codemirror/mode/haskell/haskell";
import "codemirror/mode/haskell-literate/haskell-literate";
import "codemirror/mode/haxe/haxe";
import "codemirror/mode/htmlembedded/htmlembedded";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/http/http";
import "codemirror/mode/idl/idl";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/jinja2/jinja2";
import "codemirror/mode/jsx/jsx";
import "codemirror/mode/julia/julia";
import "codemirror/mode/livescript/livescript";
import "codemirror/mode/lua/lua";
import "codemirror/mode/markdown/markdown";
import "codemirror/mode/mathematica/mathematica";
import "codemirror/mode/mbox/mbox";
import "codemirror/mode/mirc/mirc";
import "codemirror/mode/mllike/mllike";
import "codemirror/mode/modelica/modelica";
import "codemirror/mode/mscgen/mscgen";
import "codemirror/mode/mumps/mumps";
import "codemirror/mode/nginx/nginx";
import "codemirror/mode/nsis/nsis";
import "codemirror/mode/ntriples/ntriples";
import "codemirror/mode/octave/octave";
import "codemirror/mode/oz/oz";
import "codemirror/mode/pascal/pascal";
import "codemirror/mode/pegjs/pegjs";
import "codemirror/mode/perl/perl";
import "codemirror/mode/php/php";
import "codemirror/mode/pig/pig";
import "codemirror/mode/powershell/powershell";
import "codemirror/mode/properties/properties";
import "codemirror/mode/protobuf/protobuf";
import "codemirror/mode/pug/pug";
import "codemirror/mode/puppet/puppet";
import "codemirror/mode/python/python";
import "codemirror/mode/q/q";
import "codemirror/mode/r/r";
import "codemirror/mode/rpm/rpm";
import "codemirror/mode/rst/rst";
import "codemirror/mode/ruby/ruby";
import "codemirror/mode/rust/rust";
import "codemirror/mode/sas/sas";
import "codemirror/mode/sass/sass";
import "codemirror/mode/scheme/scheme";
import "codemirror/mode/shell/shell";
import "codemirror/mode/sieve/sieve";
import "codemirror/mode/slim/slim";
import "codemirror/mode/smalltalk/smalltalk";
import "codemirror/mode/smarty/smarty";
import "codemirror/mode/solr/solr";
import "codemirror/mode/soy/soy";
import "codemirror/mode/sparql/sparql";
import "codemirror/mode/spreadsheet/spreadsheet";
import "codemirror/mode/sql/sql";
import "codemirror/mode/stex/stex";
import "codemirror/mode/stylus/stylus";
import "codemirror/mode/swift/swift";
import "codemirror/mode/tcl/tcl";
import "codemirror/mode/textile/textile";
import "codemirror/mode/tiddlywiki/tiddlywiki";
import "codemirror/mode/tiki/tiki";
import "codemirror/mode/toml/toml";
import "codemirror/mode/tornado/tornado";
import "codemirror/mode/troff/troff";
import "codemirror/mode/ttcn/ttcn";
import "codemirror/mode/ttcn-cfg/ttcn-cfg";
import "codemirror/mode/turtle/turtle";
import "codemirror/mode/twig/twig";
import "codemirror/mode/vb/vb";
import "codemirror/mode/vbscript/vbscript";
import "codemirror/mode/velocity/velocity";
import "codemirror/mode/verilog/verilog";
import "codemirror/mode/vhdl/vhdl";
import "codemirror/mode/vue/vue";
import "codemirror/mode/wast/wast";
import "codemirror/mode/webidl/webidl";
import "codemirror/mode/xml/xml";
import "codemirror/mode/xquery/xquery";
import "codemirror/mode/yacas/yacas";
import "codemirror/mode/yaml/yaml";
import "codemirror/mode/yaml-frontmatter/yaml-frontmatter";
import "codemirror/mode/z80/z80";

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

function debounce(func: () => void, wait: number, immediate?: boolean) {
  var timeout: number | undefined;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = undefined;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
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
    // this.terminal.open(terminalDiv);

    const textarea = document.getElementById("code");
    if (!textarea) {
      throw Error("code textarea not found");
    }
    this.editor = CodeMirror.fromTextArea(<HTMLTextAreaElement>textarea, {
      lineNumbers: true,
      theme: "vscode-dark",
      readOnly: true,
    });
    // this.editor.setSize("100%", "100%");
    // this.hideCodeMirror();
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
    this.editor.setOption("mode", lang);
  };
  onmessage = (m) => {
    console.log(m.data);
    let event = <TextDocumentChangeEvent>JSON.parse(m.data);

    (event.selections || []).forEach((s) => {
      const lineHeight = 5;
      let t = this.editor.charCoords({ line: s.start.line, ch: 0 }, "local")
        .top;
      let middleHeight = this.editor.getScrollerElement().offsetHeight / 2;
      // this.editor.scrollTo({ left: null, top: t - middleHeight - lineHeight, behavior: "smooth ");
      this.editor.setCursor({ line: s.start.line, ch: s.start.character }, undefined, { scroll: false });
      // document.querySelector(".CodeMirror-scroll")?.scrollTo({ top: t - middleHeight - lineHeight, left: undefined, behavior: "smooth" })

      debounce(() => {
        // maybe see how editors handle this?
        // only scroll if it's out of view?
        document.querySelector(".CodeMirror-scroll")?.scrollTo({ top: t - middleHeight - lineHeight, left: undefined, behavior: "smooth" })
      }, 10)()
    });
    if (event.activeEditorChange) {
      if (event.activeEditorChange.text !== undefined) {
        this.editor.getDoc().setValue(event.activeEditorChange.text);
      }
      this.setSyntaxHighlighting(event.activeEditorChange.languageId);
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
