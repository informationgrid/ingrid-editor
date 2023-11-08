import { Component, Inject, OnDestroy } from "@angular/core";
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
export class FormDialogComponent implements OnDestroy {
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

  ngOnDestroy(): void {
    this.options.resetModel && this.options.resetModel();
  }

  submit(value: any) {
    this.dlgRef.close(value);
  }
}
