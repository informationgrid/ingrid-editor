import { Injectable } from "@angular/core";
import { Plugin } from "../../plugin";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { MatDialog } from "@angular/material/dialog";
import { catchError, filter, switchMap } from "rxjs/operators";
import { FormMenuService } from "../../../../+form/form-menu.service";
import { User } from "../../../../+user/user";
import {
  EventService,
  IgeEvent,
} from "../../../../services/event/event.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../../dialogs/confirm/confirm-dialog.component";
import { IgeError } from "../../../../models/ige-error";
import { TransferResponsibilityDialogComponent } from "../../../../+user/user/transfer-responsibility-dialog/transfer-responsibility-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "../../../../services/user/user.service";

@Injectable()
export class DefaultUserBehaviour extends Plugin {
  id = "plugin.default.user";
  defaultActive = true;
  name = "Benutzeroptionen";
  description = "Die Standard optionen für das Benutzermenü";

  constructor(
    private formMenuService: FormMenuService,
    private docEvents: DocEventsService,
    private eventService: EventService,
    private userService: UserService,
    private toast: MatSnackBar,
    private dialog: MatDialog
  ) {
    super();
  }

  register() {
    super.register();

    let selectedUser: User;
    this.subscriptions.push(
      this.userService.selectedUser$.subscribe((user) => {
        selectedUser = user;
      })
    );

    this.formMenuService.addMenuItem("user", {
      title: "Passwort zurücksetzen",
      name: "reset-password",
      action: () => this.resetPassword(selectedUser.login),
    });
    this.formMenuService.addMenuItem("user", {
      title: "Löschen",
      name: "delete-user",
      action: () => this.deleteUser(selectedUser),
    });
  }

  unregister() {
    super.unregister();
    this.formMenuService.removeMenuItem("user", "reset-password");
    this.formMenuService.removeMenuItem("user", "delete-user");
  }

  resetPassword(login: string) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Passwort zurücksetzen",
          message:
            "Möchten Sie das Passwort für den Benutzer " +
            login +
            " zurücksetzen? \n Ein neues Passwort wird generiert und an den Benutzer gesendet.",
        } as ConfirmDialogData,
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe(() => {
        this.userService
          .resetPassword(login)
          .pipe(
            catchError((err) => {
              if (
                err.error.errorText.includes("Mail server connection failed")
              ) {
                throw new IgeError(
                  "Es gab ein Problem beim Versenden der Email"
                );
              } else {
                throw err;
              }
            })
          )
          .subscribe(() => {
            this.toast.open("Passwort wurde zurückgesetzt");
          });
      });
  }

  deleteUser(user: User) {
    this.eventService
      .sendEventAndContinueOnSuccess(IgeEvent.DELETE_USER, user)
      .subscribe(() => this.openDeleteUserDialog(user));
  }

  private openDeleteUserDialog(user: User) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Benutzer löschen",
          message: `Möchten Sie den Benutzer "${user.login}" wirklich löschen?`,
        } as ConfirmDialogData,
      })
      .afterClosed()
      .pipe(
        filter((result) => result),
        switchMap(() => this.userService.deleteUser(user.id))
      )
      .subscribe(() => {
        this.userService.selectedUser$.next(null);
        this.userService.fetchUsers();
      });
  }
}
