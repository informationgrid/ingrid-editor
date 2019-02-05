import {Injectable} from '@angular/core';
import {EntityState, EntityStore, MultiActiveState, StoreConfig} from '@datorama/akita';
import {DocumentAbstract} from "../document/document.model";

export interface TreeState extends EntityState<DocumentAbstract>, MultiActiveState {
  openedNodes: DocumentAbstract[],
  selected: DocumentAbstract[],
  openedDocument: DocumentAbstract,
  expandedNodes: string[]
}

export function createStore() {
  return {
    selected: [],
    openedDocument: null,
    expandedNodes: []
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

  setExpandedNodes(ids: string[]) {
    this.updateRoot({
      expandedNodes: ids
    });
  }
}

