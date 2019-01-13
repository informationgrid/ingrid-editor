import { ID } from '@datorama/akita';

export interface TreeNode {
  parent: string;
  _id: string;
  id: ID;
  title: string;
  iconClass: string;
  hasChildren: boolean;
  state: string;
  children: TreeNode[],
  _childrenLoaded: boolean
}

/**
 * A factory function that creates Tree
 */
export function createTreeNode(params: Partial<TreeNode>) {
  return {
    title: 'no title'
  } as TreeNode;
}
