import { inject, Injectable } from "@angular/core";
import { Plugin } from "../../plugin";
import {
  EventData,
  EventResponder,
  EventService,
  IgeEvent,
  IgeEventResultType,
} from "../../../../services/event/event.service";
import { TreeQuery } from "../../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../../store/address-tree/address-tree.query";
import { ModalService } from "../../../../services/modal/modal.service";
import { filter } from "rxjs/operators";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../../dialogs/confirm/confirm-dialog.component";
import { UserService } from "../../../../services/user/user.service";
import { User } from "../../../../+user/user";
import { MatDialog } from "@angular/material/dialog";
import { PermissionsDialogComponent } from "../ShowDocumentPermissions/permissions-dialog/permissions-dialog.component";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { FormMenuService, MenuId } from "../../../../+form/form-menu.service";
import { TransferResponsibilityDialogComponent } from "../../../../+user/user/transfer-responsibility-dialog/transfer-responsibility-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormPluginsService } from "src/app/+form/form-shared/form-plugins.service";

@Injectable()
export class AssignedUserBehaviour extends Plugin {
  id = "plugin.assigned.user";
  name = "Verantwortlicher Benutzer";
  description =
    "Datensätze erhalten einen verantwortlichen Benutzer, der von Katalog Administratoren geändert werden kann. In der Benutzerverwaltung kann die Verantwortung übertragen werden. Nutzer die Verantwortlichkeiten haben können nicht gelöscht werden";
  defaultActive = true;

  constructor(
    private modal: ModalService,
    private eventService: EventService,
    private userService: UserService,
    private docEvents: DocEventsService,
    private docEventsService: DocEventsService,
    private addressTreeQuery: AddressTreeQuery,
    private documentTreeQuery: TreeQuery,
    private formMenuService: FormMenuService,
    private toast: MatSnackBar,
    private dialog: MatDialog
  ) {
    super();
    inject(FormPluginsService).registerPlugin(this);
  }

  formMenuId: MenuId;

  // FIXME: The behaviour is not loaded in the user management view, as it is loaded as a FormPluginToken. Should work after the behaviour refactoring
  register() {
    super.register();
    this.subscriptions.push(
      this.eventService
        .respondToEvent(IgeEvent.DELETE_USER)
        .subscribe((eventResponder) => this.handleEvent(eventResponder)),
      this.docEvents.onEvent("OPEN_ASSIGN_USER_DIALOG").subscribe((event) => {
        this.openAssignUserDialog(event.data.id);
      })
    );

    this.formMenuId = this.forAddress ? "address" : "dataset";

    const treeQuery = this.forAddress
      ? this.addressTreeQuery
      : this.documentTreeQuery;

    const onDocLoad = treeQuery.openedDocument$.subscribe((doc) => {
      const button = {
        title: "Verantwortlichkeit ändern",
        name: "assign-user",
        action: () =>
          this.docEventsService.sendEvent({
            type: "OPEN_ASSIGN_USER_DIALOG",
            data: { id: doc.id },
          }),
      };
      // refresh menu item
      this.formMenuService.removeMenuItem(this.formMenuId, "assign-user");
      this.formMenuService.addMenuItem(this.formMenuId, button);
    });
    this.subscriptions.push(onDocLoad);

    // add menu item for user management
    let selectedUser: User;
    this.subscriptions.push(
      this.userService.selectedUser$.subscribe((user) => {
        selectedUser = user;
      })
    );
    this.formMenuService.addMenuItem("user", {
      title: "Verantwortung übertragen",
      name: "transfer-responsibility",
      action: () => this.openTransferResponsibilityDialog(selectedUser),
    });
  }

  unregister() {
    super.unregister();
    this.formMenuService.removeMenuItem("address", "assign-user");
    this.formMenuService.removeMenuItem("dataset", "assign-user");
    this.formMenuService.removeMenuItem("user", "transfer-responsibility");
  }

  private handleEvent(eventResponder: EventResponder) {
    let success = false;
    const user = eventResponder.data as User;

    this.userService.getAssignedDatasets(user.id).subscribe((datasets) => {
      if (datasets.length > 0) {
        success = false;
        this.dialog
          .open(ConfirmDialogComponent, {
            data: {
              title: "Benutzer löschen",
              message: `Der Benutzer "${user.login}" ist noch für ${datasets.length} Datensätze verantwortlich. Bitte übertragen Sie die Verantwortung auf einen anderen Benutzer, bevor Sie diesen Benutzer löschen.`,
              confirmButtonText: "Verantwortung übertragen",
            } as ConfirmDialogData,
          })
          .afterClosed()
          .pipe(filter((result) => result))
          .subscribe(() => {
            // this.openTransferResponsibilityDialog(user);
            console.log("//TODO transfer responsibility");
          });
      } else {
        success = true;
      }
      const responseData = this.buildResponse(success);
      eventResponder.eventResponseHandler(responseData);
    });
  }

  private buildResponse(isSuccess: boolean): EventData {
    return {
      result: isSuccess ? IgeEventResultType.SUCCESS : IgeEventResultType.FAIL,
      data: isSuccess ? null : "this info comes from assigned user behaviour",
    };
  }

  private openAssignUserDialog(docId: number) {
    this.dialog
      .open(PermissionsDialogComponent, {
        width: "780px",
        data: {
          id: docId,
          forResponsibility: true,
        },
      })
      .afterClosed()
      .subscribe();
  }

  openTransferResponsibilityDialog(oldUser: User) {
    this.dialog
      .open(TransferResponsibilityDialogComponent, {
        width: "780px",
        data: {
          users: this.userService.users$.value,
          oldUser: oldUser,
        },
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe(() => {
        this.toast.open("Verantwortung übertragen.");
      });
  }
}
