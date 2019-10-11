import {Injectable} from '@angular/core';
import {EntityState, EntityStore, MultiActiveState, StoreConfig} from '@datorama/akita';
import {DocumentAbstract} from "../document/document.model";

export interface TreeState extends EntityState<DocumentAbstract>, MultiActiveState {
  // TODO: what is this used for?
  openedNodes: DocumentAbstract[],
  openedDocument: DocumentAbstract,
  expandedNodes: string[]
}

const initialState = {
  active: [],
  openedDocument: null,
  expandedNodes: []
};

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'tree'})
export class TreeStore extends EntityStore<TreeState, DocumentAbstract> {

  constructor() {
    super(initialState);
  }

  addOpenedNode(entity: DocumentAbstract) {
    this.update({
      openedNodes: [entity]
    });
  }

  setOpenedDocument(selected: DocumentAbstract) {
    this.update({
      openedDocument: selected
    });
  }

  setExpandedNodes(ids: string[]) {
    this.update({
      expandedNodes: ids
    });
  }
}

