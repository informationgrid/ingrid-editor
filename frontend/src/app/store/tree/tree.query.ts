import {Injectable} from '@angular/core';
import {QueryEntity} from '@datorama/akita';
import {TreeState, TreeStore} from './tree.store';
import {DocumentAbstract} from "../document/document.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TreeQuery extends QueryEntity<TreeState, DocumentAbstract> {

  openedDocument$: Observable<DocumentAbstract> = this.select(state => state.openedDocument);
  expandedNodes$: Observable<string[]> = this.select(state => state.expandedNodes);

  constructor(protected store: TreeStore) {
    super(store);
  }

  getChildren(parent: string): DocumentAbstract[] {
    return this.getAll().filter( doc => doc._parent === parent);
  }
}
