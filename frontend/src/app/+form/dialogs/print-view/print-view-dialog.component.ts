import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { FormlyFormOptions } from "@ngx-formly/core";

@Component({
  templateUrl: "print-view-dialog.component.html",
})
export class PrintViewDialogComponent {
  profile: any;
  form = new UntypedFormGroup({});
  options: FormlyFormOptions = {};
  formCompare = new UntypedFormGroup({});
  compareView = false;

  constructor(
    public dialogRef: MatDialogRef<PrintViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.options.formState = {
      disabled: true,
      mainModel: data.model,
    };
  }

  print() {
    window.print();
  }
}
