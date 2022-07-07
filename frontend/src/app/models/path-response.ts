export interface PathResponse {
  id: string;
  title: string;
  permissions: NodePermission;
}

export interface NodePermission {
  canRead: boolean;
  canWrite: boolean;
  canOnlyWriteSubtree: boolean;
}
