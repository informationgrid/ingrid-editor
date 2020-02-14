import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { AddressTreeStore, AddressTreeState } from './address-tree.store';
import {DocumentAbstract} from '../document/document.model';

@Injectable({ providedIn: 'root' })
export class AddressTreeQuery extends QueryEntity<AddressTreeState> {

  constructor(protected store: AddressTreeStore) {
    super(store);
  }

  getChildren(parent: string): DocumentAbstract[] {
    return this.getAll().filter( doc => doc._parent === parent);
  }
}
