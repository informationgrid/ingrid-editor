import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { TreeNode } from './tree-node.model';

export interface TreeState extends EntityState<TreeNode> {
  openedNodes: TreeNode[]
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'tree' })
export class TreeStore extends EntityStore<TreeState, TreeNode> {

  constructor() {
    super();
  }

  addOpenedNode(entity: TreeNode) {
    this.updateRoot({
      openedNodes: [entity]
    });
  }
}

