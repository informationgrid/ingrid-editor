import { Component, OnInit } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MessageService } from "../../../services/messages/message.service";

@Component({
  selector: "ige-new-message-dialog",
  templateUrl: "./new-message-dialog.component.html",
  styleUrls: ["./new-message-dialog.component.scss"],
})
export class NewMessageDialogComponent implements OnInit {
  form = new UntypedFormGroup({
    text: new UntypedFormControl("", Validators.required),
    date: new UntypedFormControl(""),
  });

  constructor(
    public dialogRef: MatDialogRef<NewMessageDialogComponent>,
    public messageService: MessageService
  ) {}

  ngOnInit(): void {}

  createMessage() {
    this.form.disable();
    const message = { text: this.form.get("text").value };
    const validUntil = this.form.get("date").value;

    this.messageService
      .createMessage(message, validUntil, false)
      .subscribe(() => this.dialogRef.close());
  }
}
