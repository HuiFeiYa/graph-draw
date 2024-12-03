/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

// 源目录路径
const sourceDir = path.resolve(__dirname, 'dist');
// 目标目录路径
const targetDir = path.resolve(__dirname, '../apps/draw-client/nodeServer');

// 清空目标目录
function clearTargetDirectory(targetDir) {
  return new Promise((resolve, reject) => {
    rimraf(targetDir, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// 递归复制目录
function copyDirectory(src, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dest, { recursive: true }, (mkdirErr) => {
      if (mkdirErr) {
        reject(mkdirErr);
        return;
      }

      fs.readdir(src, (readErr, files) => {
        if (readErr) {
          reject(readErr);
          return;
        }

        const promises = files.map((file) => {
          const srcPath = path.join(src, file);
          const destPath = path.join(dest, file);

          return new Promise((innerResolve, innerReject) => {
            fs.stat(srcPath, (statErr, stats) => {
              if (statErr) {
                innerReject(statErr);
                return;
              }

              if (stats.isDirectory()) {
                copyDirectory(srcPath, destPath).then(innerResolve).catch(innerReject);
              } else {
                fs.copyFile(srcPath, destPath, (copyErr) => {
                  if (copyErr) {
                    innerReject(copyErr);
                  } else {
                    innerResolve();
                  }
                });
              }
            });
          });
        });

        Promise.all(promises)
          .then(resolve)
          .catch(reject);
      });
    });
  });
}

// 主函数
async function main() {
  try {
    await clearTargetDirectory(targetDir);
    await copyDirectory(sourceDir, targetDir);
    console.log('复制完成');
  } catch (err) {
    console.error('发生错误:', err);
  }
}

main();