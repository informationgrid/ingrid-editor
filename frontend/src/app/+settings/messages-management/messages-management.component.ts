import { Component, OnInit } from "@angular/core";
import { MessageService } from "../../services/messages/message.service";
import { MessageFormatBackend } from "../../services/messages/message";
import { tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { FormGroup } from "@angular/forms";
import { messagesFields } from "./formly-fields";
import { MatTableDataSource } from "@angular/material/table";
import { NewMessageDialogComponent } from "./new-message-dialog/new-message-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@UntilDestroy()
@Component({
  selector: "ige-messages-management",
  templateUrl: "./messages-management.component.html",
  styleUrls: ["./messages-management.component.scss"],
})
export class MessagesManagementComponent implements OnInit {
  messages: MessageFormatBackend[] = [];
  dataSource = new MatTableDataSource<MessageFormatBackend>([]);
  displayedColumns: string[] = ["text", "_expires", "_actions_"];

  constructor(
    private messageService: MessageService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fetchMessages();
  }

  form = new FormGroup({});
  fields = messagesFields;
  model: any;

  save() {
    // this.configService.saveIBusConfig(this.form.value.ibus).subscribe();
  }

  editMessage(_id: any) {
    console.log(_id);
  }

  removeMessage(_id: any) {
    this.messageService
      .deleteMessage(_id)
      .pipe(untilDestroyed(this))
      .subscribe(() => this.fetchMessages());
  }

  showAddMessageDialog() {
    this.dialog
      .open(NewMessageDialogComponent, { hasBackdrop: true })
      .afterClosed()
      .subscribe(() => this.fetchMessages());
  }

  fetchMessages() {
    this.messageService
      .getAllMessagesForAdmin()
      .pipe(
        untilDestroyed(this),
        tap((m) => console.log(m))
      )
      .subscribe((messages) => {
        this.messages = messages;
        this.model = messages.map((m) => ({
          text: m.message.text,
          expiryDate: m._expires,
        }));
        this.dataSource.data = messages;
      });
  }
}
