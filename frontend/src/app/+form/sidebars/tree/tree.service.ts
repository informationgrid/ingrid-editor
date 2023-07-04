import { Injectable } from "@angular/core";
import { TreeNode } from "../../../store/tree/tree-node.model";
import { TreeStore } from "../../../store/tree/tree.store";
import { AddressTreeStore } from "../../../store/address-tree/address-tree.store";
import { ShortTreeNode } from "./tree.types";
import { transaction } from "@datorama/akita";

export type TreeSortFn = (a: TreeNode, b: TreeNode) => number;

@Injectable({
  providedIn: "root",
})
export class TreeService {
  private alternativeSortFunction: TreeSortFn = null;

  private sortNodesByFolderFirst = (a: TreeNode, b: TreeNode) => {
    if (a.type === "FOLDER" && b.type === "FOLDER") {
      return a.title.localeCompare(b.title);
    } else if (a.type !== "FOLDER" && b.type !== "FOLDER") {
      return a.title.localeCompare(b.title);
    } else if (a.type === "FOLDER") {
      return -1;
    } else if (b.type === "FOLDER") {
      return 1;
    }
  };

  constructor(
    private treeStore: TreeStore,
    private addressTreeStore: AddressTreeStore
  ) {}

  registerTreeSortFunction(treeSortFn: TreeSortFn) {
    if (treeSortFn !== null && this.alternativeSortFunction !== null) {
      console.error(
        "There are multiple sort functions registered for the tree. Will ignore others!"
      );
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
  @transaction()
  selectTreeNode(isAddress: boolean, id: number) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    store.update({
      explicitActiveNode: new ShortTreeNode(id, "?"),
    });
    if (id === null) {
      store.update({
        breadcrumb: [],
      });
    }
  }

  updateScrollPositionInStore(isAddress: boolean, top) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    store.update({
      scrollPosition: top,
    });
  }

  isReloadNeededWithReset(isAddress: boolean): boolean {
    const store = isAddress ? this.addressTreeStore : this.treeStore;
    const needsReload = store.getValue().needsReload;
    if (needsReload) store.update({ needsReload: false });
    return needsReload;
  }
}
