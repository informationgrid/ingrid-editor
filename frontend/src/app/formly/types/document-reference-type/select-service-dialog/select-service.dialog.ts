import { Component } from "@angular/core";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { MatDialogRef } from "@angular/material/dialog";
import { TreeQuery } from "../../../../store/tree/tree.query";

@Component({
  selector: "ige-select-service.dialog.ts",
  templateUrl: "./select-service.dialog.html",
  styleUrls: ["./select-service.dialog.scss"],
})
export class SelectServiceDialog {
  selectedNode: string;

  constructor(private dlgRef: MatDialogRef<any>, private tree: TreeQuery) {}

  enableOnlyGeoService() {
    return (node: TreeNode) => {
      return node.type !== "InGridGeoDataset";
    };
  }

  submit() {
    const uuid = this.tree.getEntity(this.selectedNode)._uuid;
    this.dlgRef.close(uuid);
  }

  selectDatasets(node: string[]) {
    this.selectedNode = node[0];
  }
}
