import {Injectable} from '@angular/core';
import {QueryEntity} from '@datorama/akita';
import {TreeState, TreeStore} from './tree.store';
import {DocumentAbstract} from '../document/document.model';
import {Observable} from 'rxjs';
import {ShortTreeNode} from '../../+form/sidebars/tree/tree.component';

@Injectable({
  providedIn: 'root'
})
export class TreeQuery extends QueryEntity<TreeState, DocumentAbstract> {

  openedDocument$: Observable<DocumentAbstract> = this.select(state => state.openedDocument);
  expandedNodes$: Observable<string[]> = this.select(state => state.expandedNodes);
  pathTitles$: Observable<ShortTreeNode[]> = this.select(state => state.activePathTitles);
  selectedNodes$: Observable<string[]> = this.select(state => state.selected);
  explicitActiveNode$: Observable<ShortTreeNode> = this.select(state => state.explicitActiveNode);

  constructor(protected store: TreeStore) {
    super(store);
  }

  getOpenedDocument(): DocumentAbstract {
    return this.store.getValue().openedDocument;
  }

  getChildren(parent: string): DocumentAbstract[] {
    return this.getAll().filter(doc => doc._parent === parent);
  }

  getFirstParentFolder(childId: string): DocumentAbstract {
    let child = this.getEntity(childId);
    if (child._type === 'FOLDER') {
      return child;
    }

    while (child._parent !== null) {
      child = this.getEntity(child._parent);
      if (child._type === 'FOLDER') {
        return child;
      }
    }

    return null;
  }
}
