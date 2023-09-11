import { inject, Injectable } from "@angular/core";
import {
  TreeService,
  TreeSortFn,
} from "../../../../+form/sidebars/tree/tree.service";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";

@Injectable({
  providedIn: "root",
})
export class SortTreeByTypeBehaviour extends Plugin {
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
    } else if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    } else {
      return a.title.localeCompare(b.title);
    }
  };

  constructor(private treeService: TreeService) {
    super();
    inject(PluginService).registerPlugin(this);
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
