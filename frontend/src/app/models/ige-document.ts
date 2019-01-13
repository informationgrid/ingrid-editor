export enum DocumentState {
  W,
  P,
  PW
}

export class IgeDocument {
  // the ID of the document, which can be undefined for new documents
  _id?: string;

  // the profile which defines the formular fields
  _profile: string;

  // the hierarchical parent of this document
  _parent: string;

  // the creation date
  _created?: string;

  // the last modified date
  _modified?: string;

  // shows if the document has child documents
  _hasChildren?: boolean;

  // the state which can be "W" (working), "P" (published) and "PW" (working after published)
  _state?: DocumentState;

  // profile specific fields
  [x: string]: any;
}
