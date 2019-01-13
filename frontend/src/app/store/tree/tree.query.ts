import {Injectable} from '@angular/core';
import {QueryEntity} from '@datorama/akita';
import {TreeState, TreeStore} from './tree.store';
import {TreeNode} from './tree-node.model';

@Injectable({
  providedIn: 'root'
})
export class TreeQuery extends QueryEntity<TreeState, TreeNode> {

  // selectTreeNodes$: Observable<TreeNode[]> = this.select(state => state.entities);

  constructor(protected store: TreeStore) {
    super(store);
  }

  get openedTreeNodes(): TreeNode[] {
    return this.getSnapshot().openedNodes;
  }
}
