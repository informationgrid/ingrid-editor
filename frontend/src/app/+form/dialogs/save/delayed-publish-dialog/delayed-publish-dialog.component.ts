import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { ModalService } from "../../../../services/modal/modal.service";
import { MatDatepickerModule } from "@angular/material/datepicker";

@Component({
  selector: "delayed-publish-dialog",
  templateUrl: "./delayed-publish-dialog.component.html",
})
export class DelayedPublishDialogComponent implements OnInit {
  form = new FormGroup({
    date: new FormControl("", Validators.required),
  });
  minDate: Date;

  constructor(
    private modalService: ModalService,
    public dialogRef: MatDialogRef<DelayedPublishDialogComponent>
  ) {}

  ngOnInit(): void {
    this.minDate = new Date();
  }

  setDateAndPublish() {
    const delayDate = this.form.get("date").value;
    if (delayDate < new Date()) {
      this.modalService.showJavascriptError(
        "Das Datum liegt in der Vergangenheit. Bitte wählen Sie ein anderes Datum."
      );
      return;
    }
    this.dialogRef.close(delayDate);
  }
}
