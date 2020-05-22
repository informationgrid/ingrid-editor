import {Injectable} from '@angular/core';
import {TreeNode} from '../../../store/tree/tree-node.model';

export type TreeSortFn = (a: TreeNode, b: TreeNode) => number;

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  private alternativeSortFunction: TreeSortFn = null;

  private sortNodesByFolderFirst = (a: TreeNode, b: TreeNode) => {
    if (a.type === 'FOLDER' && b.type === 'FOLDER') {
      return a.title.localeCompare(b.title);
    } else if (a.type !== 'FOLDER' && b.type !== 'FOLDER') {
      return a.title.localeCompare(b.title);
    } else if (a.type === 'FOLDER') {
      return -1;
    } else if (b.type === 'FOLDER') {
      return 1;
    }
  };


  constructor() {
  }

  registerTreeSortFunction(treeSortFn: TreeSortFn) {

    if (treeSortFn !== null && this.alternativeSortFunction !== null) {
      console.error('There are multiple sort functions registered for the tree. Will ignore others!');
    } else {
      this.alternativeSortFunction = treeSortFn;
    }

  }

  getSortTreeNodesFunction(): TreeSortFn {
    return this.alternativeSortFunction || this.sortNodesByFolderFirst;
  }
}
