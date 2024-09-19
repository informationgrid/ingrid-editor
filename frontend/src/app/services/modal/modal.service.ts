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
import { Injectable, NgZone } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ErrorDialogComponent } from "../../dialogs/error/error-dialog.component";
import { IgeError } from "../../models/ige-error";
import { Observable } from "rxjs";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  private dialogRef: MatDialogRef<ErrorDialogComponent>;
  errors: IgeError[] = [];
  isExclusive = false;

  constructor(
    private dialog: MatDialog,
    private ngZone: NgZone,
  ) {}

  confirmWith(
    options: ConfirmDialogData,
    hasBackdrop = true,
  ): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: options,
        maxWidth: 700,
        hasBackdrop: hasBackdrop,
        delayFocusTrap: true,
      })
      .afterClosed();
  }

  /**
   *
   * @param error
   * @param exclusive if true, shows only this error and no other
   */
  showIgeError(error: IgeError, exclusive = false) {
    // do not show error if modal is already showing an exclusive message unless it's also exclusive
    if (this.isExclusive && !exclusive) {
      return;
    }

    if (exclusive) {
      this.isExclusive = true;
      this.errors = [error];
    } else {
      this.errors.push(error);
    }

    if (this.dialogRef) {
      console.warn("Dialog already open, just updated error information");
      return;
    }

    // run the opening of the dialog within a zone, otherwise the dialog will not be closable (see #9676)
    this.ngZone.run(() => {
      this.dialogRef = this.dialog.open(ErrorDialogComponent, {
        maxWidth: 700,
        hasBackdrop: true,
        data: this.errors,
        delayFocusTrap: true,
      });
      this.dialogRef.afterClosed().subscribe(() => {
        this.dialogRef = null;
        this.errors = [];
        this.isExclusive = false;
      });
    });
  }

  /**
   *
   * @param message
   * @param moreInfo
   */
  showJavascriptError(message: string | any, moreInfo?: string) {
    // do not show error if modal is already showing an exclusive message unless it's also exclusive
    if (this.isExclusive) {
      return;
    }

    const errorObj = new IgeError();
    errorObj.message = message;

    if (this.dialogRef) {
      console.warn("Dialog already open, just updated error information");
      return;
    }

    if (moreInfo) {
      errorObj.stacktrace = moreInfo;
    } else if (message && message._body) {
      errorObj.stacktrace = message._body;
    }

    this.ngZone.run(() => {
      this.dialogRef = this.dialog.open(ErrorDialogComponent, {
        maxWidth: 700,
        hasBackdrop: true,
        data: errorObj,
      });
      this.dialogRef.afterClosed().subscribe(() => {
        this.dialogRef = null;
        this.errors = [];
        this.isExclusive = false;
      });
    });
  }

  showNotImplemented() {
    alert("Diese Funktion ist noch nicht implementiert!");
  }
}
