import {DocumentState} from '../../models/ige-document';

export class TreeNode {
  parent: string;
  iconClass?: string;
  isExpanded?: boolean;

  constructor(public _id: string,
              public title: string,
              public profile: string,
              public state: DocumentState = null,
              public level = 1,
              public hasChildren = false,
              public isLoading = false) {
  }
}
