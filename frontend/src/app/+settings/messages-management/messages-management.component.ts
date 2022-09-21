import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { MessageService } from "../../services/messages/message.service";
import { MessageFormatBackend } from "../../services/messages/message";
import { filter, switchMap, tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { UntypedFormGroup } from "@angular/forms";
import { messagesFields } from "./formly-fields";
import { MatTableDataSource } from "@angular/material/table";
import { NewMessageDialogComponent } from "./new-message-dialog/new-message-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ConfigService, UserInfo } from "../../services/config/config.service";
import { userInfo } from "os";
import { MatSort, MatSortable, Sort } from "@angular/material/sort";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";

@UntilDestroy()
@Component({
  selector: "ige-messages-management",
  templateUrl: "./messages-management.component.html",
  styleUrls: ["./messages-management.component.scss"],
})
export class MessagesManagementComponent implements OnInit {
  messages: MessageFormatBackend[] = [];
  dataSourceAllCatalog = new MatTableDataSource<MessageFormatBackend>([]);
  dataSourceCurrentCatalog = new MatTableDataSource<MessageFormatBackend>([]);
  displayedColumns: string[] = ["text", "_expires", "_actions_"];
  constructor(
    private messageService: MessageService,
    private dialog: MatDialog,
    private configService: ConfigService
  ) {}

  private userInfo: UserInfo;
  @ViewChild("allCatalogSort") public allCatalogSort: MatSort;
  @ViewChild("currentCatalogSort") public currentCatalogSort: MatSort;

  ngOnInit() {
    this.userInfo = this.configService.$userInfo.getValue();
    this.fetchMessages();
  }

  form = new UntypedFormGroup({});
  fields = messagesFields;
  model: any;

  save() {
    // this.configService.saveIBusConfig(this.form.value.ibus).subscribe();
  }

  editMessage(_id: any) {
    console.log(_id);
  }

  removeMessage(_id: any) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Benachrichtigung löschen",
          message: "Möchten Sie die Benachrichtigung wirklich löschen?",
        } as ConfirmDialogData,
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.messageService
            .deleteMessage(_id)
            .pipe(untilDestroyed(this))
            .subscribe(() => this.fetchMessages());
        }
      });
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
          validUntil: m._validUntil,
        }));
        this.dataSourceAllCatalog.data = messages.filter(
          (value) => value.catalog == null
        );
        this.dataSourceCurrentCatalog.data = messages.filter(
          (value) =>
            value.catalog != null &&
            value.catalog.id == this.userInfo.currentCatalog.id
        );
      });
  }
}
