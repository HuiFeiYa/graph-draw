import { join, resolve } from "path";
const arv1 = process.argv[1];
console.log('arv1:',arv1)
console.log('resolve(arv1', resolve(arv1, '..'))
class ResourceUtil {
  readonly rootDir = resolve(arv1, '..')
  readonly projectDbDir = join(this.rootDir, '../db')
  getProjectDbName(projectId: string) {
    return 'project_' + projectId;
  }
  getProjectDbFilePath(projectId:string) {
    console.log('---------this.projectDbDir--------', this.projectDbDir);
    return join(this.projectDbDir, 'project_' + projectId + '.db');
  }
}


export const resourceUtil = new ResourceUtil();