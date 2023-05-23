export type DocumentState = "P" | "W" | "PW" | "PENDING";

export class IgeDocument {
  // the ID of the document, which can be undefined for new documents
  _id?: number;

  // the ID of the wrapper document, which contains this document
  _uuid?: string;

  // the title of the document, which also can be dynamically added by other fields
  title?: string;

  // the document type, which defines the formular fields
  _type: string;

  // the hierarchical parent of this document
  _parent: number;

  // the creation date
  _created?: string;

  // the database object modification date
  _modified?: string;

  // the content modification by an actual user date
  _contentModified?: string;

  // the name of the creator
  _createdBy?: string;

  // check if creator of document is still among the users
  _creatorExists?: boolean;

  // check if modifier of document is still among the users
  _modifierExists?: boolean;

  // the name of the last modifier
  _contentModifiedBy?: string;

  // shows if the document has child documents
  _hasChildren?: boolean;

  // the state which can be "W" (working), "P" (published) and "PW" (working after published)
  _state?: DocumentState;

  hasWritePermission?: boolean;

  // the date when the document will be published next
  _pendingDate?: string;

  hasOnlySubtreeWritePermission?: boolean;

  // profile specific fields
  [x: string]: any;

  constructor(type: string, parent?: number) {
    this._type = type;
    this._parent = parent ? parent : null;
  }
}
