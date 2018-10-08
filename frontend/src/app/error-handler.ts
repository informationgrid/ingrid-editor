import { ErrorHandler, Injectable } from '@angular/core';
import { ModalService } from './services/modal/modal.service';
import { IgeError } from './models/ige-error';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private modalService: ModalService) {
  }

  handleError(error) {
    // debugger;
    console.log("HANDLE ERROR", error);

    if (error instanceof IgeError) {
      this.modalService.showIgeError( error );
    } else if (error instanceof HttpErrorResponse) {
      const e = new IgeError();
      // e.setMessage(error.message, error.error);
      e.setMessage(error.message, error.error.message ? error.error.message : error.error);
      this.modalService.showIgeError(e);
    } else {
      // alert('This error should be handled differently!')
      this.modalService.showJavascriptError(error.message, error.stack);
    }
  }

}
