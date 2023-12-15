/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {
    if (data.buttons) {
      this.leftAlignedButtons = data.buttons.filter(
        (button) => !button.alignRight,
      );
      this.rightAlignedButtons = data.buttons.filter(
        (button) => button.alignRight,
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
