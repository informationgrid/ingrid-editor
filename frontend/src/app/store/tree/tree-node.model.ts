export interface TreeNode {
  _id: string;
  hasChildren: boolean;
  parent: string;
  profile: string;
  state: string;
  title: string;
  iconClass?: string;
  isExpanded?: boolean;
  isLoading?: boolean;
  isSelected?: boolean;
  level?: number;
}

/**
 * A factory function that creates Tree
 */
export function createTreeNode(params: Partial<TreeNode>) {
  return {
    title: 'no title'
  } as TreeNode;
}
