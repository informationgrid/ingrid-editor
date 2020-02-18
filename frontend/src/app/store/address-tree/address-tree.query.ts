import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { AddressTreeStore, AddressTreeState } from './address-tree.store';
import {DocumentAbstract} from '../document/document.model';
import {Observable} from 'rxjs';
import {TreeNode} from "../tree/tree-node.model";

@Injectable({ providedIn: 'root' })
export class AddressTreeQuery extends QueryEntity<AddressTreeState> {

  openedDocument$: Observable<DocumentAbstract> = this.select(state => state.openedDocument);
  pathTitles$: Observable<string[]> = this.select(state => state.activePathTitles);

  constructor(protected store: AddressTreeStore) {
    super(store);
  }

  getChildren(parent: string): DocumentAbstract[] {
    return this.getAll()
      .filter( doc => doc._parent === parent)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  getFirstParentFolder(childId: string): DocumentAbstract {
    let child = this.getEntity(childId);
    if (child._profile === "FOLDER") {
      return child;
    }

    while (child._parent !== null) {
      child = this.getEntity(child._parent);
      if (child._profile === "FOLDER") {
        return child;
      }
    }

    return null;
  }
}
