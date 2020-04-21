import {Injectable} from '@angular/core';
import {EntityState, EntityStore, MultiActiveState, StoreConfig} from '@datorama/akita';
import {DocumentAbstract} from '../document/document.model';

export interface TreeState extends EntityState<DocumentAbstract>, MultiActiveState {
  // TODO: what is this used for?
  openedNodes: DocumentAbstract[],
  openedDocument: DocumentAbstract,
  expandedNodes: string[],
  activePathTitles: string[],
  explicitActiveNode: string
}

const initialState = {
  active: [],
  openedDocument: null,
  expandedNodes: [],
  activePathTitles: [],
  explicitActiveNode: null
};

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'tree'})
export class TreeStore extends EntityStore<TreeState, DocumentAbstract> {

  constructor() {
    super(initialState);
  }
}

