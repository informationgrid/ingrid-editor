import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatDialogRef } from "@angular/material/dialog";

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: "ige-link-dialog",
  templateUrl: "./link-dialog.component.html",
  styleUrls: ["./link-dialog.component.scss"],
})
export class LinkDialogComponent {
  private URL_REGEXP =
    "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)";

  form = new FormGroup(
    {
      title: new FormControl(),
      url: new FormControl("", [
        Validators.required,
        Validators.pattern(this.URL_REGEXP),
      ]),
    },
    { updateOn: "blur" }
  );

  matcher = new MyErrorStateMatcher();

  constructor(public dialogRef: MatDialogRef<LinkDialogComponent>) {}

  submit() {
    this.dialogRef.close(this.form.value);
  }
}
