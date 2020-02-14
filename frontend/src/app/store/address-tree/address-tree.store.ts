import { Injectable } from '@angular/core';
import {EntityState, EntityStore, MultiActiveState, StoreConfig} from '@datorama/akita';
import {DocumentAbstract} from '../document/document.model';

export interface AddressTreeState extends EntityState<DocumentAbstract>, MultiActiveState {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'address-tree' })
export class AddressTreeStore extends EntityStore<AddressTreeState> {

  constructor() {
    super();
  }

}

