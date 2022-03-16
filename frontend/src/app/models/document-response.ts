import { DocumentState, IgeDocument } from "./ige-document";

export interface DocumentMetadata {
  _id: string;
  _type: string;
  _created: Date;
  _modified: Date;
  _createdBy: string;
  _modifiedBy: string;
  _parent: string;
  _pendingDate: Date;
  _hasChildren: boolean;
  _state: DocumentState;
  hasWritePermission: boolean;
  hasOnlySubtreeWritePermission: boolean;
}

export interface DocumentResponse {
  document: IgeDocument;
  metadata: DocumentMetadata;
}
