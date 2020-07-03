import {ErrorHandler, Injectable} from '@angular/core';
import {ModalService} from './services/modal/modal.service';
import {IgeError} from './models/ige-error';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private modalService: ModalService) {
  }

  handleError(error) {

    console.log('HANDLE ERROR', error);

    if (error instanceof IgeError) {
      this.modalService.showIgeError(error);
    } else if (error instanceof HttpErrorResponse) {
      const e = new IgeError();
      e.setMessage(error.message, (error.error && error.error.message) ? error.error.message : error.error);
      this.modalService.showIgeError(e);
    } else if (error.rejection) {
      const e = new IgeError();
      e.setMessage(error.rejection.message, error.rejection.error);
      this.modalService.showIgeError(e);
    } else {
      this.modalService.showJavascriptError(error.message, error.stack);
    }

  }

}
