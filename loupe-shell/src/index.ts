import * as pty from "node-pty";
import * as WebSocket from "ws";
import { performance } from 'perf_hooks';

type TerminalData = {
  stdin?: string;
  stdout?: string;
};


function throttle(func: () => void, minimumPause: number) {
  let last: number | undefined;
  return function () {
    const now = performance.now()
    // only call the function it we haven't called it within the
    // last minimumPause milliseconds
    if (!last || (last && now - last > minimumPause)) {
      last = now;
      func()
    }
    // don't call the function this time
  };
}

class Shell {
  ws: WebSocket;
  shell: string;
  id?: number;
  pty?: pty.IPty;
  stdinSend: () => void;
  constructor() {
    const shell = process.env.SHELL;
    if (!shell) {
      console.log(
        "no shell found, exiting. make sure $SHELL is set with the shell you want to spawn"
      );
      process.exit(1);
    }
    this.stdinSend = throttle(() => {
      this.ws.send(JSON.stringify({ stdin: true }));
    }, 1000);
    this.shell = shell;
    this.ws = new WebSocket("ws://localhost:21456/terminal");
    this.ws.onerror = this.onerror
    this.ws.onopen = () => { };
    this.ws.onmessage = (msg) => {
      const payload = <{ id: number }>JSON.parse(msg.data.toString())
      this.id = payload.id
      this.spawn();
    }
  }
  onerror = (e: any) => {
    console.log(e)
  }
  spawn = () => {
    console.log("Spawning new shell");
    process.stdin.setRawMode(true);
    process.stdin.write('\x1b[?1005h');
    process.stdin.write('\x1b[?1003h');
    this.pty = pty.spawn(this.shell, [], {
      cols: process.stdout.columns,
      rows: process.stdout.rows,
    });


    this.sendSize();
    process.stdout.on("resize", this.onResize);
    process.stdin.on("data", (e: Buffer) => {
      this.stdinSend()
      if (/^\u001b\[M/.test(e.toString())) {
        return
      }
      this.pty?.write(e.toString());
    });

    this.pty.onData((e) => {
      process.stdout.write(e);
      this.ws.send(JSON.stringify({ data: e }));
    });
    this.pty.onExit(this.onExit);
  }
  onExit = ({ exitCode }: { exitCode: number }) => {
    process.stdin.write('\x1b[?1005l');
    process.stdin.write('\x1b[?1003l');
    process.stdin.setRawMode(false);
    this.ws.close();
    process.exit(exitCode);
  }
  onResize = () => {
    this.sendSize();
    this.pty?.resize(process.stdout.columns, process.stdout.rows);
  }
  sendSize = () => {
    this.ws.send(
      JSON.stringify({
        resize: { rows: process.stdout.rows, columns: process.stdout.columns },
      })
    );
  };
}

new Shell()