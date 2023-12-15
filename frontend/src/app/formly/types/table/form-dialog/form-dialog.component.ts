/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormlyFieldConfig, FormlyFormOptions } from "@ngx-formly/core";
import { UntypedFormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

export interface FormDialogData {
  fields: FormlyFieldConfig[];
  model: any;
  newEntry?: boolean;
  formState?: any;
}

@UntilDestroy()
@Component({
  selector: "ige-form-dialog",
  templateUrl: "./form-dialog.component.html",
  styleUrls: ["./form-dialog.component.scss"],
})
export class FormDialogComponent implements OnInit, OnDestroy {
  form = new UntypedFormGroup({});
  titleText: string;
  options: FormlyFormOptions = {};
  disabled = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FormDialogData,
    private dlgRef: MatDialogRef<string>,
  ) {
    this.titleText = data?.newEntry
      ? "Eintrag hinzufügen"
      : "Eintrag bearbeiten";
    this.options.formState = data.formState;

    this.form.statusChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      setTimeout(() => {
        if (value === "VALID") this.disabled = false;
        else if (value === "INVALID") this.disabled = true;
      });
    });
  }

  ngOnInit() {
    if (Object.keys(this.data.model).length > 0) {
      setTimeout(() => {
        this.form.markAllAsTouched();
        // @ts-ignore
        this.form._updateTreeValidity();
      });
    }
  }

  ngOnDestroy(): void {
    this.options.resetModel && this.options.resetModel();
  }

  submit(value: any) {
    this.dlgRef.close(value);
  }
}
