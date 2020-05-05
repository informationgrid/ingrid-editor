import {Injectable} from '@angular/core';
import {EntityState, EntityStore, MultiActiveState, StoreConfig} from '@datorama/akita';
import {DocumentAbstract} from '../document/document.model';
import {ShortTreeNode} from '../../+form/sidebars/tree/tree.component';

export interface AddressTreeState extends EntityState<DocumentAbstract>, MultiActiveState {
  openedNodes: DocumentAbstract[],
  openedDocument: DocumentAbstract,
  expandedNodes: string[],
  activePathTitles: ShortTreeNode[],
  explicitActiveNode: ShortTreeNode
}

const initialState = {
  active: [],
  openedDocument: null,
  expandedNodes: [],
  activePathTitles: [],
  explicitActiveNode: undefined
};


@Injectable({providedIn: 'root'})
@StoreConfig({name: 'address-tree'})
export class AddressTreeStore extends EntityStore<AddressTreeState> {

  constructor() {
    super(initialState);
  }

}

