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
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormDialogData } from "../form-dialog/form-dialog.component";
import { FormlyFieldConfig, FormlyFormOptions } from "@ngx-formly/core";

@Component({
  selector: "ige-link-dialog",
  templateUrl: "./link-dialog.component.html",
  styleUrls: ["./link-dialog.component.scss"],
})
export class LinkDialogComponent implements OnInit, AfterViewInit {
  form = new UntypedFormGroup({});

  options: FormlyFormOptions = {};

  data: FormDialogData = { fields: [], model: null };

  constructor(
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<LinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private formData: FormDialogData,
  ) {}

  ngAfterViewInit(): void {
    // prevent expression has changed error for form validity on submit button
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.data = {
      fields: this.adaptFields(),
      model: null,
    };
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
