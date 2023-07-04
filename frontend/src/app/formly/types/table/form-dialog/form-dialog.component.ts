import { Component, Inject, OnDestroy } from "@angular/core";
import { FormlyFieldConfig, FormlyFormOptions } from "@ngx-formly/core";
import { UntypedFormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface FormDialogData {
  fields: FormlyFieldConfig[];
  model: any;
  newEntry?: boolean;
  formState?: any;
}

@Component({
  selector: "ige-form-dialog",
  templateUrl: "./form-dialog.component.html",
  styleUrls: ["./form-dialog.component.scss"],
})
export class FormDialogComponent implements OnDestroy {
  form = new UntypedFormGroup({});
  titleText: string;
  options: FormlyFormOptions = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: FormDialogData) {
    this.titleText = data?.newEntry
      ? "Eintrag hinzufügen"
      : "Eintrag bearbeiten";
    this.options.formState = data.formState;
  }

  ngOnDestroy(): void {
    this.options.resetModel && this.options.resetModel();
  }
}
