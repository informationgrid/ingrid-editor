import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { TreeNode } from './tree-node.model';
import {DocumentAbstract} from "../document/document.model";

export interface TreeState extends EntityState<DocumentAbstract> {
  openedNodes: DocumentAbstract[],
  selected: DocumentAbstract[],
  openedDocument: DocumentAbstract
}

export function createStore() {
  return {
    selected: [],
    openedDocument: null
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'tree' })
export class TreeStore extends EntityStore<TreeState, DocumentAbstract> {

  constructor() {
    super(createStore());
  }

  addOpenedNode(entity: DocumentAbstract) {
    this.updateRoot({
      openedNodes: [entity]
    });
  }

  setSelected(selection: DocumentAbstract[]) {
    this.updateRoot({
      selected: selection
    });
  }

  setOpenedDocument(selected: DocumentAbstract) {
    this.updateRoot({
      openedDocument: selected
    });
  }
}

