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
import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { TreeComponent } from "../../../../+form/sidebars/tree/tree.component";
import { DialogTemplateComponent } from "../../../../shared/dialog-template/dialog-template.component";
import { TreeStore } from "../../../../store/tree/tree.store";
import { GeneralStore } from "../../../../store/general.store";

export interface SelectDatasetData {
  currentRefs: string[];
  activeRef?: string;
  layerNames?: string[];
  showLayernames: boolean;
  removeButton?: boolean;
  onlyInternalReferences?: boolean;
  allowMultiSelect?: boolean;
  docTypeFilter?: string[];
  titleOfDocumentSelectorDialog?: string;
}

export interface SelectServiceResponse {
  title: string;
  uuid: string;
  state: string;
  type: string;
  layerNames: string[];
  icon: string;
}

@Component({
  templateUrl: "./selector-service-dialog.component.html",
  styleUrl: "./selector-service-dialog.component.scss",
  imports: [DialogTemplateComponent, TreeComponent, FormlyModule],
})
export class SelectorServiceDialogComponent {
  private generalStore = inject(GeneralStore);
  private treeStore = inject(TreeStore);
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
  label: String = "Dokument auswählen";
  docTypeFilter = [];
  public showLayernames = false;

  constructor(
    private dlgRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) private data: SelectDatasetData,
  ) {
    if (data.activeRef) {
      setTimeout(() => {
        const node = this.treeStore.getByUuid(data.activeRef);
        this.initialNode.next(parseInt(node.id.toString()));
      });
    }
    this.model.layerNames = data.layerNames ?? [];
    this.showLayernames = data.showLayernames;
    this.docTypeFilter = data.docTypeFilter;
    this.label = data.titleOfDocumentSelectorDialog;
  }

  disableTreeNodes() {
    const currentDocUuid = this.generalStore.getOpenedDocument(false)._uuid;
    return (node: TreeNode) => {
      return (
        this.isDoctypeNotAllowed(node.type) ||
        this.isNodeAlreadyPresent(node) ||
        node._uuid === currentDocUuid
      );
    };
  }

  private isNodeAlreadyPresent(node: TreeNode) {
    return this.data.currentRefs.indexOf(node._uuid) !== -1;
  }

  private isDoctypeNotAllowed(docType: string) {
    return this.docTypeFilter.length && !this.docTypeFilter.includes(docType);
  }

  async submit() {
    const entity = await this.treeStore.byId(this.selectedNode);
    let response: SelectServiceResponse = {
      title: entity.title,
      state: entity._state,
      uuid: entity._uuid,
      type: entity._type,
      layerNames: this.form.value.layerNames,
      icon: entity.icon,
    };
    this.dlgRef.close(response);
  }

  selectDatasets(node: number[]) {
    this.selectedNode = node[0];
  }
}
