import {Injectable} from '@angular/core';
import {QueryEntity} from '@datorama/akita';
import {TreeState, TreeStore} from './tree.store';
import {DocumentAbstract} from "../document/document.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TreeQuery extends QueryEntity<TreeState, DocumentAbstract> {

  // selectTreeNodes$: Observable<TreeNode[]> = this.select(state => state.entities);
  selectedDocuments$: Observable<DocumentAbstract[]> = this.select(state => state.selected);
  openedDocument$: Observable<DocumentAbstract> = this.select(state => state.openedDocument);
  expandedNodes$: Observable<string[]> = this.select(state => state.expandedNodes);

  constructor(protected store: TreeStore) {
    super(store);
  }

  get openedTreeNodes(): DocumentAbstract[] {
    return this.getValue().openedNodes;
  }

  get openedDocument(): DocumentAbstract {
    return this.getValue().openedDocument;
  }

  get selectedDocuments(): DocumentAbstract[] {
    return this.getValue().selected;
  }

  get expandedNodes(): string[] {
    return this.getValue().expandedNodes;
  }
}
