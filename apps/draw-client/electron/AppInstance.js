const { resolve } = require("path");
const { app } = require("electron");
const fs = require("fs");
const fork = require("child_process").fork;
const dayjs = require("dayjs");
console.log('process.env', process.env)
const isDevelopment = process.env.NODE_ENV === 'development'
class AppInstance {
  async start() {
    this.startNodeServer();
  }
  async startNodeServer() {
    const nodeScript = resolve(__dirname, isDevelopment ? "../public/nodeServer/main.js" : "../dist/nodeServer/main.js");
    console.log("nodeScript:", nodeScript);
    const subProcess = fork(
      nodeScript,
      ["--prod", "--appPath", app.getAppPath()],
      {
        cwd: resolve(nodeScript, ".."),
        stdio: "pipe",
      }
    );
    // C:\Users\admin\AppData\Roaming\draw-client
    const { logPath } = this.createLogger();
    console.log("-------------");
    subProcess.stdout &&
      subProcess.stdout.on("data", (str) => {
        console.log("subProcess:", str.toString());
        fs.appendFile(
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

        fs.appendFile(
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
  createLogger() {
    const userDataPath = app.getPath("userData");
    const logDir = resolve(userDataPath, "./logs");
    let options = {
      flags: "a", // append模式
      encoding: "utf8", // utf8编码
    };
    console.log("logDir:", logDir);
    // 确保日志目录存在
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logPath = resolve(
      logDir,
      "hfdraw." + dayjs().format("YYYY-MM-DD_HH-mm-ss") + ".log"
    );
    console.log("logPath:", logPath);
    return {
      logPath,
    };
  }
}

module.exports = {
  AppInstance,
};
