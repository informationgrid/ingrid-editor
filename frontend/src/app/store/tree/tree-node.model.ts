export class TreeNode {
  parent: string;
  iconClass?: string;
  isExpanded?: boolean;
  isSelected?: boolean;

  constructor(public _id: string,
              public title: string,
              public profile: string,
              public state: string = null,
              public level = 1,
              public hasChildren = false,
              public isLoading = false) {
  }
}

/**
 * A factory function that creates Tree
 */
export function createTreeNode(params: Partial<TreeNode>) {
  return {
    title: 'no title'
  } as TreeNode;
}
