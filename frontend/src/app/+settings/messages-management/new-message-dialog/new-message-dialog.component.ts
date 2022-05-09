import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MessageService } from "../../../services/messages/message.service";

@Component({
  selector: "ige-new-message-dialog",
  templateUrl: "./new-message-dialog.component.html",
  styleUrls: ["./new-message-dialog.component.scss"],
})
export class NewMessageDialogComponent implements OnInit {
  form = new FormGroup({
    text: new FormControl("", Validators.required),
    date: new FormControl(""),
  });

  constructor(
    public dialogRef: MatDialogRef<NewMessageDialogComponent>,
    public messageService: MessageService
  ) {}

  ngOnInit(): void {}

  createMessage() {
    this.form.disable();
    const message = { text: this.form.get("text").value };
    const expiryDate = this.form.get("date").value;

    this.messageService
      .createMessage(message, expiryDate, false)
      .subscribe(() => this.dialogRef.close());
  }
}
