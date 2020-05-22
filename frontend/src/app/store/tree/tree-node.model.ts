import {DocumentState} from '../../models/ige-document';

export class TreeNode {
  isExpanded?: boolean;

  constructor(public _id: string,
              public title: string = 'Kein Titel',
              public type: string,
              public state: DocumentState = null,
              public level = 1,
              public hasChildren = false,
              public parent: string = null,
              public iconClass: string = 'Fachaufgabe',
              public isLoading = false) {
  }
}
