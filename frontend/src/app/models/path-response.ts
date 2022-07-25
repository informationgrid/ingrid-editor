export interface PathResponse {
  id: string;
  title: string;
  permission: NodePermission;
}

export interface NodePermission {
  canRead: boolean;
  canWrite: boolean;
  canOnlyWriteSubtree: boolean;
}
