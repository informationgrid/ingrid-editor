import { ID } from "@datorama/akita";
import { DocumentState } from "../../models/ige-document";

export interface DocumentAbstract {
  id: ID | string;
  title: string;
  icon: string;
  _state: DocumentState;
  _type: string;
  _parent: string;
  _hasChildren: boolean;
  _modified: any;
  _pendingDate: any;
  _uuid: any;
  hasWritePermission?: boolean;
  hasOnlySubtreeWritePermission?: boolean;
  isRoot: boolean;
}

/**
 * A factory function that creates Document
 */
export function createDocument(params: Partial<DocumentAbstract>) {
  return {
    ...params,
  } as DocumentAbstract;
}
