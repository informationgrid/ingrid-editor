import { Injectable, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';

interface DialogContent {
  message: string;
}

@Injectable()
export class ModalService {

  errorDialog = new Subject<DialogContent>();

  errorDialog$ = this.errorDialog.asObservable();

  containerRef: ViewContainerRef = null;

  constructor() {
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

    this.errorDialog.next(errorObj);
  }

  showNotImplemented() {
    this.showError('Diese Funktion ist noch nicht implementiert!');
  }
}
