import {Injectable} from '@angular/core';
import {TreeNode} from '../../../store/tree/tree-node.model';
import {TreeStore} from '../../../store/tree/tree.store';
import {AddressTreeStore} from '../../../store/address-tree/address-tree.store';
import {ShortTreeNode} from './tree.types';

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


  constructor(private treeStore: TreeStore, private addressTreeStore: AddressTreeStore) {
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

  /**
   * Set active TreeNode
   * @param isAddress
   * @param id
   */
  selectTreeNode(isAddress: boolean, id: string) {

    const store = isAddress ? this.addressTreeStore : this.treeStore;

    store.update({
      explicitActiveNode: new ShortTreeNode(id, '?')
    });

  }
}
