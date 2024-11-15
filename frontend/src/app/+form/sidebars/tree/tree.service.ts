/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { inject, Injectable } from "@angular/core";
import { TreeNode } from "../../../store/tree/tree-node.model";
import { ShortTreeNode } from "./tree.types";
import { GeneralStore } from "../../../store/general.store";
import { UiStore } from "../../../store/ui.store";

export type TreeSortFn = (a: TreeNode, b: TreeNode) => number;

@Injectable({
  providedIn: "root",
})
export class TreeService {
  private generalStore = inject(GeneralStore);
  private uiStore = inject(UiStore);

  private alternativeSortFunction: TreeSortFn = null;

  private sortNodesByFolderFirst = (a: TreeNode, b: TreeNode) => {
    if (a.type === "FOLDER" && b.type === "FOLDER") {
      return a.title.localeCompare(b.title);
    } else if (a.type !== "FOLDER" && b.type !== "FOLDER") {
      //sort based on IDs for matched dataset names
      if (a.title === b.title)
        return a._id.toString().localeCompare(b._id.toString());
      return a.title.localeCompare(b.title);
    } else if (a.type === "FOLDER") {
      return -1;
    } else if (b.type === "FOLDER") {
      return 1;
    }
  };

  constructor() {}

  registerTreeSortFunction(treeSortFn: TreeSortFn) {
    if (treeSortFn !== null && this.alternativeSortFunction !== null) {
      console.error(
        "There are multiple sort functions registered for the tree. Will ignore others!",
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
  selectTreeNode(isAddress: boolean, id: number) {
    console.log("tree select node", id);
    this.generalStore.setExplicitActiveNode(
      new ShortTreeNode(id, "?"),
      isAddress,
    );
    if (id === null) {
      this.generalStore.setBreadCrumb([], isAddress);
    }
  }

  updateScrollPositionInStore(isAddress: boolean, top) {
    this.uiStore.setScrollPosition(top);
  }

  isReloadNeededWithReset(isAddress: boolean): boolean {
    const needsReload = this.generalStore.getNeedsReload(isAddress);
    if (needsReload) this.generalStore.setNeedsReload(isAddress, false);
    return needsReload;
  }
}
