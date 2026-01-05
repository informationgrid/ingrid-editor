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
import { Component, Inject, OnInit, signal } from "@angular/core";
import {
  FormGroup,
  ReactiveFormsModule,
  UntypedFormGroup,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormDialogData } from "../form-dialog/form-dialog.component";
import {
  FormlyFieldConfig,
  FormlyForm,
  FormlyFormOptions,
} from "@ngx-formly/core";
import { DialogTemplateComponent } from "../../../../shared/dialog-template/dialog-template.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "ige-link-dialog",
  templateUrl: "./link-dialog.component.html",
  styleUrls: ["./link-dialog.component.scss"],
  imports: [DialogTemplateComponent, ReactiveFormsModule, FormlyForm],
})
export class LinkDialogComponent implements OnInit {
  form = new FormGroup({});

  options: FormlyFormOptions = {};

  data = signal<FormDialogData>({ fields: [], model: null });
  valid = signal<boolean>(false);

  constructor(
    public dialogRef: MatDialogRef<LinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private formData: FormDialogData,
  ) {
    this.form.statusChanges.pipe(takeUntilDestroyed()).subscribe((state) => {
      this.valid.set(state === "VALID");
    });
  }

  ngOnInit(): void {
    this.data.set({
      fields: this.adaptFields(),
      model: null,
    });
  }

  private adaptFields() {
    // do not modify original data
    return this.formData.fields.map((field) => {
      return field.type === "upload" ? this.useLinkInput(field) : field;
    });
  }

  submit() {
    const value = this.prepareResult(this.form.value);
    this.dialogRef.close(value);
  }

  private useLinkInput(field: FormlyFieldConfig): FormlyFieldConfig {
    return {
      key: field.key,
      type: "input",
      props: { ...field.props, label: "URL" },
      validators: {
        validation: ["url"],
      },
    };
  }

  private prepareResult(value: any) {
    const uploadKey = this.formData.fields.find(
      (field) => field.type === "upload",
    )?.key as string;
    const result = {
      ...value,
    };
    result[uploadKey] = {
      asLink: true,
      value: result[uploadKey],
      uri: result[uploadKey],
    };
    return result;
  }
}
