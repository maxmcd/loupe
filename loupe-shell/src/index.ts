import * as pty from "node-pty";
import * as WebSocket from "ws";
const shell = process.env.SHELL;
if (!shell) {
  console.log(
    "no shell found, exiting. make sure $SHELL is set with the shell you want to spawn"
  );
  process.exit(1);
}

type TerminalData = {
  stdin?: string;
  stdout?: string;
};

let ws = new WebSocket("ws://localhost:21456/terminal");
ws.onerror = (e) => {
  console.log(e);
};
ws.onopen = () => {
  run();
};

const sendSize = () => {
  ws.send(
    JSON.stringify({
      resize: { rows: process.stdout.rows, columns: process.stdout.columns },
    })
  );
};
const run = () => {
  console.log("Spawning new shell");
  process.stdin.setRawMode(true);
  let subprocess = pty.spawn(shell, [], {
    cols: process.stdout.columns,
    rows: process.stdout.rows,
    cwd: "/home/maxm/go/src/github.com/maxmcd/loupe",
  });
  sendSize();
  process.stdout.on("resize", () => {
    sendSize();
    subprocess.resize(process.stdout.columns, process.stdout.rows);
  });
  process.stdin.on("data", (e: Buffer) => {
    subprocess.write(e.toString());
    ws.send(JSON.stringify({ stdin: true }));
  });

  subprocess.onData((e) => {
    process.stdout.write(e);
    ws.send(JSON.stringify({ data: e }));
  });

  subprocess.onExit(({ exitCode }) => {
    process.stdin.setRawMode(false);
    ws.close();
    process.exit(exitCode);
  });
};
