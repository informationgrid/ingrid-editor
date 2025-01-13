/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Component, inject, Inject } from "@angular/core";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";

import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { DialogTemplateComponent } from "../../../../shared/dialog-template/dialog-template.component";
import { TreeComponent } from "../../../../+form/sidebars/tree/tree.component";
import { DocumentService } from "../../../../services/document/document.service";
import { TreeStore } from "../../../../store/tree/tree.store";

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
    imports: [FormlyModule, DialogTemplateComponent, TreeComponent]
})
export class SelectGeoDatasetDialog {
  private documentService = inject(DocumentService);
  private documentTreeStore = inject(TreeStore);

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
    @Inject(MAT_DIALOG_DATA) private data: SelectGeoDatasetData,
  ) {
    if (data.activeRef) {
      setTimeout(() => {
        const node = this.documentTreeStore.getByUuid(data.activeRef);
        if (node) {
          this.initialNode.next(parseInt(node.id.toString()));
        } else {
          this.documentService
            .load(data.activeRef, false, false, true)
            .subscribe((doc) => this.initialNode.next(doc.metadata.wrapperId));
        }
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
    const entity = this.documentTreeStore.entityMap()[this.selectedNode];
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
