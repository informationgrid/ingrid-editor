import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { DocumentAbstract } from './document.model';
import {IgeDocument} from "../../models/ige-document";

export interface DocumentState extends EntityState<DocumentAbstract> {
  openedDocument: IgeDocument,
  selected: DocumentAbstract[]
}

export function createStore() {
  return {
    openedDocument: null,
    selected: []
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'Document', idKey: '_id' })
export class DocumentStore extends EntityStore<DocumentState, DocumentAbstract> {

  constructor() {
    super(createStore());
  }

  setOpenedDocument(doc: IgeDocument) {
    this.updateRoot({ openedDocument: doc });
  }

  setSelected(docs: DocumentAbstract[]) {
    this.updateRoot({selected: docs});
  }

  setRecent(docs: DocumentAbstract[]) {
    this.updateRoot({recent: docs});
  }
}

