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

  onNoClick(): void {
    this.dialogRef.close();
  }

  print() {
    // window.print();
    // const printContent = document.getElementById("print-content");
    // const target = document.getElementById("print-me");
    // target.innerHTML = printContent.innerHTML;
    window.print();

    /*const WindowPrt = window.open(
      "",
      "",
      "left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0"
    );
    WindowPrt.document.write(printContent.innerHTML);
    WindowPrt.document.head.insertAdjacentHTML(
      "beforeend",
      '<link rel="stylesheet" type="text/css" href="/style.css"/>'
    );

    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();*/
  }
}
