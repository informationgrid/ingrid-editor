import { Component, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MessageService } from "../../../services/messages/message.service";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import {
  ConfigService,
  UserInfo,
} from "../../../services/config/config.service";

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

  currentCatalog: boolean = false;
  public userInfo: UserInfo;
  constructor(
    public dialogRef: MatDialogRef<NewMessageDialogComponent>,
    public messageService: MessageService,
    private fb: UntypedFormBuilder,
    private configService: ConfigService,
  ) {}

  ngOnInit(): void {
    this.userInfo = this.configService.$userInfo.getValue();
  }

  slideToggleChange(event: MatSlideToggleChange) {
    this.currentCatalog = event.source.checked;
  }

  createMessage() {
    this.form.disable();
    const message = { text: this.form.get("text").value };
    const validUntil = this.form.get("date").value;
    this.messageService
      .createMessage(message, validUntil, !this.currentCatalog)
      .subscribe(() => this.dialogRef.close());
  }
}
