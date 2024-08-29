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
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";
import { CookieService } from "../../services/cookie.service";
import { MatCheckbox, MatCheckboxChange } from "@angular/material/checkbox";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

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
    standalone: true,
    imports: [
        MatIconButton,
        MatDialogClose,
        MatIcon,
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        MatFormField,
        MatInput,
        ReactiveFormsModule,
        FormsModule,
        MatDialogActions,
        MatCheckbox,
        MatButton,
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
