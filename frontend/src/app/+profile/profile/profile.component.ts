import { Component, OnInit } from "@angular/core";
import { ConfigService } from "../../services/config/config.service";
import { UserService } from "../../services/user/user.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ChangeEmailDialogComponent } from "../change-email-dialog/change-email-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ChangeNameDialogComponent } from "../change-name-dialog/change-name-dialog.component";
import { FrontendUser } from "../../+user/user";

@Component({
  selector: "ige-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  constructor(
    private configService: ConfigService,
    public userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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

  openChangeEmailDialog(): void {
    this.dialog
      .open(ChangeEmailDialogComponent, {
        data: {
          email: this.userInfo$.value.email,
        },
        hasBackdrop: true,
      })
      .afterClosed()
      .subscribe((user) => {
        if (user)
          this.configService.getCurrentUserInfo().then(() =>
            this.snackBar.open("E-Mail Adresse wurde geändert.", "", {
              panelClass: "green",
            })
          );
      });
  }

  changeEmail(newMail: string): void {
    if (!newMail) return;
    newMail = newMail.trim();
    this.userService
      .updateCurrentUser(
        new FrontendUser({
          attributes: [],
          creationDate: undefined,
          firstName: "",
          lastName: "",
          login: "",
          modificationDate: undefined,
          organisation: "",
          role: "",
          email: newMail,
        })
      )
      .subscribe((user) => {
        if (user)
          this.configService.getCurrentUserInfo().then(() =>
            this.snackBar.open("E-Mail Adresse wurde geändert.", "", {
              panelClass: "green",
            })
          );
      });
  }

  openResetPasswordDialog(): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        maxWidth: 700,
        data: (<ConfirmDialogData>{
          title: "Passwort ändern",
          message:
            "Um Ihr Passwort zu ändern, führen Sie bitte folgende Schritte durch:",
          list: [
            `Fordern Sie die E-Mail an, die Ihnen die Änderung Ihres Passworts ermöglicht (die E-Mail wird an ${this.userInfo$.value.email} gesendet)`,
            "Öffnen Sie über den darin enthaltenen Link die Formularseite, auf der Sie Ihr Passwort ändern können.",
            "Bitte beachten Sie, dass der Link nur 24 Std. gültig ist.",
          ],
          buttons: [
            { text: "Abbrechen" },
            {
              text: "E-Mail anfordern",
              id: "sendResetMail",
              alignRight: true,
              emphasize: true,
            },
          ],
        }) as ConfirmDialogData,
        hasBackdrop: true,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response === "sendResetMail") {
          this.userService
            .sendPasswordChangeRequest(this.userInfo$.value.userId)
            .subscribe(() =>
              this.snackBar.open("E-Mail wurde versandt", "", {
                panelClass: "green",
              })
            );
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
      })
      .afterClosed()
      .subscribe((user) => {
        if (user)
          this.configService.getCurrentUserInfo().then(() =>
            this.snackBar.open("Name wurde geändert.", "", {
              panelClass: "green",
            })
          );
      });
  }
}
