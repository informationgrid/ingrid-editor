import { Injectable, NgZone } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ErrorDialogComponent } from "../../dialogs/error/error-dialog.component";
import { IgeError } from "../../models/ige-error";
import { Observable } from "rxjs";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";

interface DialogContent {
  message: string;
}

@Injectable({
  providedIn: "root",
})
export class ModalService {
  private dialogRef: MatDialogRef<ErrorDialogComponent, any>;
  errors: IgeError[] = [];
  isExclusive = false;

  constructor(private dialog: MatDialog, private ngZone: NgZone) {}

  confirmWith(options: ConfirmDialogData): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: options,
        maxWidth: 700,
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
      console.log("Dialog already open, just updated error information");
      return;
    }

    // run the opening of the dialog within a zone, otherwise the dialog will not be closable (see #9676)
    this.ngZone.run(() => {
      this.dialogRef = this.dialog.open(ErrorDialogComponent, {
        maxWidth: 700,
        data: this.errors,
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
      console.log("Dialog already open, just updated error information");
      return;
    }

    if (moreInfo) {
      errorObj.stacktrace = moreInfo;
    } else if (message && message._body) {
      errorObj.stacktrace = message._body;
    }

    /*const dialogRef = this.dialog.open(ErrorDialogComponent, {
      width: '250px',
      data: errorObj
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });*/

    this.ngZone.run(() => {
      this.dialogRef = this.dialog.open(ErrorDialogComponent, {
        maxWidth: 700,
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
