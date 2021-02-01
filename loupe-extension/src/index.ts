import * as os from "os";
import * as fs from "fs";
import * as net from "net";
export function start_socket() {
  const homedir = os.homedir();
  const loupeDir = homedir + "/.loupe";

  // Make loupe dir if it doesn't exist
  if (!fs.existsSync(loupeDir)) fs.mkdirSync(loupeDir);

  const srv = new net.Server();
  srv.listen(loupeDir + "/shared.sock", () => {
    console.log();
  });
  srv.on("connection", (conn) => {
    console.log(conn);
  });
}

start_socket();
