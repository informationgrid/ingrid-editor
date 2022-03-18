import { DocumentState, IgeDocument } from "./ige-document";

export interface DocumentMetadata {
  created: Date;
  createdBy: string;
  hasChildren: boolean;
  hasOnlySubtreeWritePermission: boolean;
  hasWritePermission: boolean;
  id: string;
  modified: Date;
  modifiedBy: string;
  parent: string;
  pendingDate: Date;
  state: DocumentState;
  type: string;
  version: number;
}

export interface DocumentResponse {
  document: IgeDocument;
  metadata: DocumentMetadata;
}
