export interface PathResponse {
  id: number;
  title: string;
  permission: NodePermission;
}

export interface NodePermission {
  canRead: boolean;
  canWrite: boolean;
  canOnlyWriteSubtree: boolean;
}
