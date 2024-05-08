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
import { Component, Inject } from "@angular/core";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TreeQuery } from "../../../../store/tree/tree.query";
import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { DialogTemplateModule } from "../../../../shared/dialog-template/dialog-template.module";
import { SharedModule } from "../../../../shared/shared.module";
import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";

export interface SelectGeoDatasetData {
  currentRefs: string[];
  activeRef?: string;
  layerNames?: string[];
  showLayernames: boolean;
}

export interface SelectServiceResponse {
  title: string;
  uuid: string;
  state: string;
  layerNames: string[];
}

@Component({
  templateUrl: "./select-geo-dataset-dialog.component.html",
  styleUrls: ["./select-geo-dataset-dialog.component.scss"],
  imports: [DialogTemplateModule, SharedModule, FormlyModule],
  standalone: true,
})
export class SelectGeoDatasetDialog {
  selectedNode: number = null;
  field: FormlyFieldConfig[] = [
    {
      key: "layerNames",
      type: "repeatList",
    },
  ];
  form = new FormGroup<any>({});
  model = { layerNames: [] };
  initialNode = new Subject<number>();
  public showLayernames = false;

  constructor(
    private dlgRef: MatDialogRef<any>,
    private tree: TreeQuery,
    @Inject(MAT_DIALOG_DATA) private data: SelectGeoDatasetData,
  ) {
    if (data.activeRef) {
      setTimeout(() => {
        const node = tree.getByUuid(data.activeRef);
        this.initialNode.next(parseInt(node.id.toString()));
      });
    }
    this.model.layerNames = data.layerNames ?? [];
    this.showLayernames = data.showLayernames;
  }

  enableOnlyGeoService() {
    return (node: TreeNode) => {
      return (
        node.type !== "InGridGeoDataset" ||
        this.data.currentRefs.indexOf(node._uuid) !== -1
        // (node._uuid === this.data.activeRef && this.data.currentRefs.indexOf(node._uuid) !== -1)
      );
    };
  }

  submit() {
    const entity = this.tree.getEntity(this.selectedNode);
    this.dlgRef.close({
      title: entity.title,
      state: entity._state,
      uuid: entity._uuid,
      layerNames: this.form.value.layerNames,
    });
  }

  selectDatasets(node: number[]) {
    this.selectedNode = node[0];
  }
}
