class ResourceUtil {
  getProjectDbName(projectId: string) {
    return 'project_' + projectId;
  }
}


export const resourceUtil = new ResourceUtil();