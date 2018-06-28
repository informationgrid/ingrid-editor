import { Injectable, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs/index';
import { MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../../dialogs/error/error-dialog.component';

interface DialogContent {
  message: string;
}

@Injectable()
export class ModalService {

  errorDialog = new Subject<DialogContent>();

  errorDialog$ = this.errorDialog.asObservable();

  containerRef: ViewContainerRef = null;

  constructor(private dialog: MatDialog) {
  }

  /**
   *
   * @param message
   * @param moreInfo
   */
  showError(message: string | any, moreInfo?: string) {
    const errorObj: any = {
      message: message
    };
    if (moreInfo) {
      errorObj.moreInfo = moreInfo;
    } else if (message && message._body) {
      errorObj.moreInfo = message._body;
    }

    /*const dialogRef = this.dialog.open(ErrorDialogComponent, {
      width: '250px',
      data: errorObj
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });*/

    this.dialog.open(ErrorDialogComponent, {
      data: errorObj
    });

    this.errorDialog.next(errorObj);
  }

  showNotImplemented() {
    this.showError('Diese Funktion ist noch nicht implementiert!');
  }
}
