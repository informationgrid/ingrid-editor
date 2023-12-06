import { inject, Injectable } from "@angular/core";
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
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "../../../../services/user/user.service";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";

@Injectable()
export class DefaultUserBehaviour extends Plugin {
  id = "plugin.default.user";
  defaultActive = true;
  name = "Benutzeroptionen";
  description = "Die Standard-Optionen für das Benutzermenü";
  hide = true;

  constructor(
    private formMenuService: FormMenuService,
    private eventService: EventService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  register() {
    super.register();

    let selectedUser: User;
    this.subscriptions.push(
      this.userService.selectedUser$.subscribe((user) => {
        selectedUser = user;
      }),
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

  private resetPassword(login: string) {
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
                  "Es gab ein Problem beim Versenden der Email",
                );
              } else {
                throw err;
              }
            }),
          )
          .subscribe(() => {
            this.snackBar.open("Passwort wurde zurückgesetzt");
          });
      });
  }

  private deleteUser(user: User) {
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
        switchMap(() => this.userService.deleteUser(user.id)),
      )
      .subscribe(() => {
        this.userService.selectedUser$.next(null);
        this.userService.fetchUsers();
      });
  }
}
