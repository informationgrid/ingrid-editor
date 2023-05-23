import { ID } from "@datorama/akita";
import { DocumentState } from "../../models/ige-document";

export interface DocumentAbstract {
  id: ID | number;
  title: string;
  icon: string;
  _state: DocumentState;
  _type: string;
  _parent: number;
  _hasChildren: boolean;
  _modified: any;
  _contentModified: any;
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
