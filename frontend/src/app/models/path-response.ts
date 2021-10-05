export interface PathResponse {
  id: string;
  title: string;
  permission: {
    canRead: boolean;
    canWrite: boolean;
    canOnlyWriteSubtree: boolean;
  };
}
