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
import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { CodelistService } from "../../../services/codelist/codelist.service";
import { FreeEntry } from "../../../store/codelist/codelist.model";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatButton, MatIconButton } from "@angular/material/button";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { map, startWith } from "rxjs/operators";
import { FormlyFieldConfig, FormlyForm } from "@ngx-formly/core";
import { toSignal } from "@angular/core/rxjs-interop";

export interface FreeEntryReplaceDialogData {
  codelistId: string;
  selectedEntry?: FreeEntry;
}

@Component({
  selector: "ige-free-entry-replace-dialog",
  templateUrl: "./free-entry-replace-dialog.component.html",
  styles: [
    `
      mat-dialog-content {
        --mat-dialog-with-actions-content-padding: 20px 24px 0px 24px;
      }
    `,
  ],
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ReactiveFormsModule,
    FormsModule,
    MatIcon,
    MatButton,
    MatIconButton,
    NgxMatSelectSearchModule,
    FormlyForm,
  ],
})
export class FreeEntryReplaceDialogComponent implements OnInit {
  selectedEntry?: FreeEntry;
  toForm = new UntypedFormGroup({});
  toFields: FormlyFieldConfig[] = [];

  isToFormInvalid = toSignal(
    this.toForm.statusChanges.pipe(
      startWith(this.toForm.status),
      map(() => this.toForm.invalid),
    ),
    { initialValue: this.toForm.invalid },
  );

  constructor(
    private dialogRef: MatDialogRef<FreeEntryReplaceDialogComponent>,
    private codelistService: CodelistService,
    @Inject(MAT_DIALOG_DATA) public data: FreeEntryReplaceDialogData,
  ) {}

  ngOnInit(): void {
    this.selectedEntry = this.data.selectedEntry;
    this.toFields = [
      {
        key: "toKey",
        type: "ige-select",
        wrappers: ["form-field"],
        className: "width-100",
        props: {
          label: "Ersetzen durch (Codelisteneintrag)",
          externalLabel: "Ersetzen durch (Codelisteneintrag)",
          appearance: "outline",
          options: this.codelistService.observe(this.data.codelistId, "label"),
          showSearch: true,
          allowNoValue: false,
          simple: true,
          required: true,
        },
      },
    ];
  }

  replace() {
    const toKey = this.toForm.value?.toKey?.trim();
    if (!toKey) return;
    this.dialogRef.close(toKey);
  }
}
