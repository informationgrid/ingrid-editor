import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";
import { CookieService } from "../../services/cookie.service";
import { MatCheckboxChange } from "@angular/material/checkbox";

export interface ConfirmDialogData {
  title: string;
  message: string;
  list?: string[];
  confirmText?: string;
  confirmButtonText?: string;
  buttons?: ConfirmDialogButton[];
  preformatted?: boolean;
  cookieId?: string;
  hideCancelButton?: boolean;
}

export interface ConfirmDialogButton {
  id?: string;
  text: string;
  emphasize?: boolean;
  alignRight?: boolean;
  disabledWhenNotConfirmed?: boolean;
}

@Component({
  templateUrl: "confirm-dialog.component.html",
  styles: [
    `
      .mat-mdc-dialog-content p {
        white-space: normal;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  textConfirmed: string;
  leftAlignedButtons: ConfirmDialogButton[];
  rightAlignedButtons: ConfirmDialogButton[];

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    private cookieService: CookieService,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    if (data.buttons) {
      this.leftAlignedButtons = data.buttons.filter(
        (button) => !button.alignRight
      );
      this.rightAlignedButtons = data.buttons.filter(
        (button) => button.alignRight
      );
    } else {
      // default buttons
      this.leftAlignedButtons = [{ text: "Abbrechen" }];
      this.rightAlignedButtons = [
        { text: data.confirmButtonText ?? "Ok", id: "ok", emphasize: true },
      ];
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  updateCookie($event: MatCheckboxChange) {
    $event.checked
      ? this.cookieService.setCookie({
          name: this.data.cookieId,
          value: "true",
          expireDays: 730,
        })
      : this.cookieService.deleteCookie(this.data.cookieId);
  }
}
