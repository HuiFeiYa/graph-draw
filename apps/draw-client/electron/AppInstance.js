import { fileURLToPath } from 'url';
import { resolve, dirname  } from "path";
import { app } from "electron";
import { appendFile } from "fs/promises";
import { fork  } from 'child_process';
import dayjs from "dayjs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class AppInstance {
  async start() {
    this.startNodeServer();
  }
  async startNodeServer() {
    const nodeScript = resolve(__dirname, "../nodeServer/main.js");
    console.log("nodeScript:", nodeScript);
    const subProcess = fork(
      nodeScript,
      ["--prod", "--appPath", app.getAppPath()],
      {
        cwd: resolve(nodeScript, ".."),
        stdio: "pipe",
      }
    );
    const userDataPath = app.getPath("userData");
    const logDir = resolve(userDataPath, "../logs");
    console.log("userDataPath:", userDataPath);
    console.log("logDir:", logDir);
    const logPath = resolve(
      logDir,
      "hfdraw." + dayjs().format("YYYY-MM-DD_HH-mm-ss") + ".log"
    );
    subProcess.stdout &&
      subProcess.stdout.on("data", (str) => {
        appendFile(
          logPath,
          dayjs().format("YYYY-MM-DD HH:mm:ss") + " " + str.toString(),
          { flag: "a" },
          (err) => {
            err && console.error(err);
          }
        );
      });
    subProcess.stderr &&
      subProcess.stderr.on("data", (err) => {
        console.error("node error:", err.toString());

        appendFile(
          logPath,
          dayjs().format("YYYY-MM-DD HH:mm:ss") +
            " " +
            err.name +
            err.message +
            (err.stack && err.stack.toString()),
          { flag: "a" },
          (err1) => {
            err1 && console.error(err1);
          }
        );
      });
    console.log("await service ready");
  }
}
