import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";
import { FormGroup, UntypedFormGroup } from "@angular/forms";

@Component({
  templateUrl: "print-view-dialog.component.html",
})
export class PrintViewDialogComponent {
  profile: any;
  form = new UntypedFormGroup({});

  constructor(
    public dialogRef: MatDialogRef<PrintViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    setTimeout(() => this.form.disable());
  }

  print() {
    window.print();
  }
}
