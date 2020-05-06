import {Injectable} from '@angular/core';
import {EntityState, EntityStore, MultiActiveState, StoreConfig} from '@datorama/akita';
import {DocumentAbstract} from '../document/document.model';
import {ShortTreeNode} from '../../+form/sidebars/tree/tree.component';
import {TreeState} from '../tree/tree.store';

const initialState = {
  active: [],
  openedDocument: null,
  expandedNodes: [],
  activePathTitles: [],
  explicitActiveNode: undefined,
  scrollPosition: 0
};


@Injectable({providedIn: 'root'})
@StoreConfig({name: 'address-tree'})
export class AddressTreeStore extends EntityStore<TreeState> {

  constructor() {
    super(initialState);
  }

}

