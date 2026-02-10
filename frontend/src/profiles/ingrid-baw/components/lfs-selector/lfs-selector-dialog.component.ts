/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { Component, inject } from "@angular/core";
import { MatButton, MatIconButton } from "@angular/material/button";
import { UntypedFormGroup } from "@angular/forms";
import { FormlyFieldConfig, FormlyForm } from "@ngx-formly/core";
import { LongTermFileStorageTreeStore } from "../../../../app/store/tree/long-term-file-storage-tree.store";
import { MatIcon } from "@angular/material/icon";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";

@Component({
  templateUrl: "lfs-selector-dialog.component.html",
  imports: [
    MatDialogActions,
    MatButton,
    FormlyForm,
    MatDialogContent,
    MatDialogClose,
    MatIcon,
    MatDialogTitle,
    MatIconButton,
    CdkDragHandle,
    CdkDrag,
  ],
})
export class LfsSelectorDialogComponent {
  treeStoreLongTermFileStorage = inject(LongTermFileStorageTreeStore);

  fields = [
    <FormlyFieldConfig>{
      key: "lfs",
      type: "documentReferenceSelector",
      className: "flex-1",
      props: {
        docTypeFilter: [],
        treeStore: this.treeStoreLongTermFileStorage,
        allowRedirectToDocument: false,
        allowMultiSelect: false,
        titleOfDocumentSelectorDialog: "Datei auswählen",
        required: true,
        hideHeader: true,
      },
    },
    {
      key: "description",
      type: "input",
      props: {
        label: "Beschreibung",
        appearance: "outline",
      },
    },
  ];
  model = {};
  form = new UntypedFormGroup({});

  constructor(public dialogRef: MatDialogRef<LfsSelectorDialogComponent>) {}
}
