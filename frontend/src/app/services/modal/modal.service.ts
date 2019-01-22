import { Injectable, NgZone, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../dialogs/error/error-dialog.component';
import { IgeError } from '../../models/ige-error';

interface DialogContent {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  containerRef: ViewContainerRef = null;
  private dialogRef: MatDialogRef<ErrorDialogComponent, any>;
  errors: IgeError[] = [];

  constructor(private dialog: MatDialog, private ngZone: NgZone) {
  }

  showIgeError(error: IgeError) {
    this.errors.push( error );

    if (this.dialogRef) {
      console.log( 'Dialog already open, just updated error information' );
      return;
    }

    // run the opening of the dialog within a zone, otherwise the dialog will not be closable (see #9676)
    this.ngZone.run( () => {
      this.dialogRef = this.dialog.open( ErrorDialogComponent, {
        data: this.errors
      } );
      this.dialogRef.afterClosed().subscribe( () => {
        this.dialogRef = null;
        this.errors = [];
      } );
    } );
  }

  /**
   *
   * @param message
   * @param moreInfo
   */
  showJavascriptError(message: string | any, moreInfo?: string) {
    const errorObj = new IgeError();
    errorObj.message = message;

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

    this.ngZone.run( () => {
      this.dialog.open( ErrorDialogComponent, {
        data: errorObj
      } );
    });

  }

  showNotImplemented() {
    alert( 'Diese Funktion ist noch nicht implementiert!' );
  }
}
