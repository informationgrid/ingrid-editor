import {Injectable} from '@angular/core';
import {EntityState, EntityStore, MultiActiveState, StoreConfig} from '@datorama/akita';
import {DocumentAbstract} from '../document/document.model';

export interface AddressTreeState extends EntityState<DocumentAbstract>, MultiActiveState {
}

const initialState = {
  active: [],
  openedDocument: null,
  expandedNodes: [],
  activePathTitles: []
};


@Injectable({providedIn: 'root'})
@StoreConfig({name: 'address-tree'})
export class AddressTreeStore extends EntityStore<AddressTreeState> {

  constructor() {
    super(initialState);
  }

}

