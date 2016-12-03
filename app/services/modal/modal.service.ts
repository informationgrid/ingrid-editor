import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

interface DialogContent {
  message: string;
}

@Injectable()
export class ModalService {

  errorDialog = new Subject<DialogContent>();

  errorDialog$ = this.errorDialog.asObservable();

  constructor() {
  }

  /**
   *
   * @param message
   */
  showError(message: string, moreInfo) {
    let errorObj = {
      message: message
    };
    if (moreInfo) errorObj.moreInfo = moreInfo;

    this.errorDialog.next(errorObj);
  }

  showNotImplemented() {
    this.showError('Diese Funktion ist noch nicht implementiert!');
  }
}