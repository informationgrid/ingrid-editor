import { ErrorHandler, Injectable } from '@angular/core';
import { ModalService } from './services/modal/modal.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private modalService: ModalService) {
  }

  handleError(error) {
    // if (error instanceof Response) {
    if (typeof error.text === 'function') {
      this.modalService.showError(error.text());
    } else {
      this.modalService.showError(error.message, error.stack);
    }

    // IMPORTANT: Rethrow the error otherwise it gets swallowed
    throw error;
  }

}
