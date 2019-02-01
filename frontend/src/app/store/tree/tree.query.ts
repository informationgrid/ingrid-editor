import {Injectable} from '@angular/core';
import {QueryEntity} from '@datorama/akita';
import {TreeState, TreeStore} from './tree.store';
import {TreeNode} from './tree-node.model';
import {DocumentAbstract} from "../document/document.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TreeQuery extends QueryEntity<TreeState, DocumentAbstract> {

  // selectTreeNodes$: Observable<TreeNode[]> = this.select(state => state.entities);
  selectedDocuments$: Observable<DocumentAbstract[]> = this.select(state => state.selected);
  openedDocument$: Observable<DocumentAbstract> = this.select(state => state.openedDocument);

  constructor(protected store: TreeStore) {
    super(store);
  }

  get openedTreeNodes(): DocumentAbstract[] {
    return this.getSnapshot().openedNodes;
  }

  get openedDocument(): DocumentAbstract {
    return this.getSnapshot().openedDocument;
  }

  get selectedDocuments(): DocumentAbstract[] {
    return this.getSnapshot().selected;
  }
}
