import { existsSync } from "fs";
import { readFile } from "fs/promises";
import * as JsZip from 'jszip';
import { ApiCode } from "src/utils/http/ApiCode";
import { ResException } from "src/utils/http/ResException";

export class ProjectUtil {
    async getZipByFilePath(filePath: string) {

        if (!existsSync(filePath)) {
          console.error(filePath);
          throw new ResException(ApiCode.ERROR, '文件不存在');
        }
        let buffer:Buffer;
        try {
          buffer = await readFile(filePath);
    
        } catch (error) {
          console.error(error);
    
          if (error.code == 'EPERM') {
            throw new ResException(ApiCode.ERROR, '文件权限不足');
    
          } else {
            throw new ResException(ApiCode.ERROR, '文件读取失败');
    
          }
    
        }
        const zip = new JsZip();
        try {
          await zip.loadAsync(buffer);
    
        } catch (error) {
          console.error(error);
          throw new ResException(ApiCode.ERROR, 'zip格式错误');
        }
        return zip;
      }
}

export const projectUtil = new ProjectUtil();