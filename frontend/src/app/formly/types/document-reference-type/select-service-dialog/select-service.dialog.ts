import { Component, Inject } from "@angular/core";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TreeQuery } from "../../../../store/tree/tree.query";

export interface SelectServiceResponse {
  title: string;
  uuid: string;
  state: string;
}

@Component({
  selector: "ige-select-service.dialog.ts",
  templateUrl: "./select-service.dialog.html",
  styleUrls: ["./select-service.dialog.scss"],
})
export class SelectServiceDialog {
  selectedNode: string = null;

  constructor(
    private dlgRef: MatDialogRef<any>,
    private tree: TreeQuery,
    @Inject(MAT_DIALOG_DATA) private currentRefs: string[]
  ) {}

  enableOnlyGeoService() {
    return (node: TreeNode) => {
      return (
        node.type !== "InGridGeoDataset" ||
        this.currentRefs.indexOf(node._uuid) !== -1
      );
    };
  }

  submit() {
    const entity = this.tree.getEntity(this.selectedNode);
    this.dlgRef.close({
      title: entity.title,
      state: entity._state,
      uuid: entity._uuid,
    });
  }

  selectDatasets(node: string[]) {
    this.selectedNode = node[0];
  }
}
