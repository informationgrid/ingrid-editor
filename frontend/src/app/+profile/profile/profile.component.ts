/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, OnInit } from "@angular/core";
import { ConfigService } from "../../services/config/config.service";
import { UserService } from "../../services/user/user.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ChangeNameDialogComponent } from "../change-name-dialog/change-name-dialog.component";
import { filter } from "rxjs/operators";
import { PageTemplateNoHeaderComponent } from "../../shared/page-template/page-template-no-header.component";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";
import { EmailformComponent } from "../../emailform/emailform.component";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "ige-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
  standalone: true,
  imports: [
    PageTemplateNoHeaderComponent,
    MatIcon,
    MatButton,
    EmailformComponent,
    AsyncPipe,
  ],
})
export class ProfileComponent implements OnInit {
  constructor(
    private configService: ConfigService,
    public userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  userInfo$ = this.configService.$userInfo;

  editingEmail = false;

  getRoleLabel(role: string): string {
    return (
      this.userService.availableRoles.find((r) => r.value == role)?.label ??
      role
    );
  }

  ngOnInit(): void {}

  changeEmail(newMail: string): void {
    if (!newMail) {
      this.editingEmail = false;
      return;
    }

    newMail = newMail.trim();

    this.userService
      .updateCurrentUser({
        email: newMail,
      })
      .subscribe(() => {
        this.configService.getCurrentUserInfo().then(() => {
          this.editingEmail = false;
          this.snackBar.open("E-Mail Adresse wurde geändert.", "", {
            panelClass: "green",
          });
        });
      });
  }

  openResetPasswordDialog(): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        maxWidth: 700,
        data: (<ConfirmDialogData>{
          title: "Passwort ändern",
          message:
            "Sie werden zur Login-Seite umgeleitet, wo Sie aufgefordert werden, Ihr neues Passwort zu vergeben. " +
            "Eventuell müssen Sie sich mit ihrem alten Passwort anmelden, um die Änderung vorzunehmen. " +
            "Möchten Sie Ihr Passwort jetzt ändern?",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Passwort ändern",
              id: "resetPassword",
              alignRight: true,
              emphasize: true,
            },
          ],
        }) as ConfirmDialogData,
        hasBackdrop: true,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response === "resetPassword") {
          this.userService.updatePassword();
        }
      });
  }

  openChangeNameDialog() {
    this.dialog
      .open(ChangeNameDialogComponent, {
        data: {
          firstName: this.userInfo$.value.firstName,
          lastName: this.userInfo$.value.lastName,
        },
        hasBackdrop: true,
        minWidth: 400,
      })
      .afterClosed()
      .pipe(filter((modified) => modified))
      .subscribe(() => {
        this.configService.getCurrentUserInfo().then(() =>
          this.snackBar.open("Name wurde geändert.", "", {
            panelClass: "green",
          }),
        );
      });
  }
}
