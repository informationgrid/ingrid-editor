/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
export type DocumentState = "P" | "W" | "PW" | "PENDING";

export class DocumentWithMetadata {
  document: IgeDocument;
  documentWithMetadata: IgeDocument;
  metadata: Metadata;
}

export class Metadata {
  // the ID of the document, which can be undefined for new documents
  wrapperId?: number;

  // the ID of the wrapper document, which contains this document
  uuid?: string;

  // the document type, which defines the formular fields
  docType: string;

  // the hierarchical parent of this document
  parentId: number;

  // the creation date
  created?: string;

  // the database object modification date
  modified?: string;

  metadataDate?: string;

  responsibleUser?: number;

  // the content modification by an actual user date
  contentModified?: string;

  // the name of the creator
  createdBy?: string;

  // check if creator of document is still among the users
  creatorExists?: boolean;

  // check if modifier of document is still among the users
  modifierExists?: boolean;

  // the name of the last modifier
  contentModifiedBy?: string;

  // shows if the document has child documents
  hasChildren?: boolean;

  // the state which can be "W" (working), "P" (published) and "PW" (working after published)
  state?: DocumentState;

  // the date when the document will be published next
  pendingDate?: string;

  tags?: string;

  hasWritePermission?: boolean;

  hasOnlySubtreeWritePermission?: boolean;

  version?: number;
}

export class IgeDocument {
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

  _metadataDate?: string;

  _responsibleUser?: number;

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

  _tags?: string;

  hasOnlySubtreeWritePermission?: boolean;

  // profile specific fields
  [x: string]: any;

  constructor(type: string, parent?: number) {
    // this._type = type;
    // this._parent = parent ? parent : null;
  }
}
