import { Component, OnInit } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { ModalService } from "../../../../services/modal/modal.service";

@Component({
  selector: "delayed-publish-dialog",
  templateUrl: "./delayed-publish-dialog.component.html",
})
export class DelayedPublishDialogComponent implements OnInit {
  form = new UntypedFormGroup({
    date: new UntypedFormControl("", Validators.required),
  });
  minDate: Date;

  constructor(
    private modalService: ModalService,
    public dialogRef: MatDialogRef<DelayedPublishDialogComponent>,
  ) {}

  ngOnInit(): void {
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);
  }

  setDateAndPublish() {
    const delayDate = this.form.get("date").value;
    if (delayDate < new Date()) {
      this.modalService.showJavascriptError(
        "Das Datum liegt in der Vergangenheit. Bitte wählen Sie ein anderes Datum.",
      );
      return;
    }
    this.dialogRef.close(delayDate);
  }
}
