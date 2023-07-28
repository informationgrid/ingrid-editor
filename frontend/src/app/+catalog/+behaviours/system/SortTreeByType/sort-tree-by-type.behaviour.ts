import { Injectable } from "@angular/core";
import {
  TreeService,
  TreeSortFn,
} from "../../../../+form/sidebars/tree/tree.service";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { Plugin2 } from "../../plugin2";

@Injectable({
  providedIn: "root",
})
export class SortTreeByTypeBehaviour extends Plugin2 {
  id = "plugin.sort.tree.by.type";
  name = "Sortierung des Baums nach Dokumententyp";
  group = "Baum";
  defaultActive = false;

  description =
    "Anstatt die Baumknoten nach dem Titel zu sortieren, werden diese " +
    "nach dem Dokumenttyp sortiert. Verzeichnisse erscheinen weiterhin als erstes.";

  private sortByDocumentType: TreeSortFn = (a: TreeNode, b: TreeNode) => {
    // folders first
    if (a.type === "FOLDER" && b.type !== "FOLDER") {
      return -1;
    } else if (a.type !== "FOLDER" && b.type === "FOLDER") {
      return 1;
    } else {
      return a.type.localeCompare(b.type);
    }
  };

  constructor(private treeService: TreeService) {
    super();
  }

  register() {
    console.log("Register Sort Tree behaviour");
    super.register();

    this.treeService.registerTreeSortFunction(this.sortByDocumentType);
  }

  unregister() {
    super.unregister();
    this.treeService.registerTreeSortFunction(null);
  }
}
