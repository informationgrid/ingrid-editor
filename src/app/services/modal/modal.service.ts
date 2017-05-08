import {Injectable, ViewContainerRef} from "@angular/core";
import {Subject} from "rxjs";

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
   */
  showError(message: string|any, moreInfo?: string) {
    let errorObj: any = {
      message: message
    };
    if (moreInfo) errorObj.moreInfo = moreInfo;
    else if (message._body) errorObj.moreInfo = message._body;

    this.errorDialog.next(errorObj);
  }

  showNotImplemented() {
    this.showError('Diese Funktion ist noch nicht implementiert!');
  }
}