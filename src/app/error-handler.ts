import { ErrorHandler, Injectable } from '@angular/core';
import { ModalService } from './services/modal/modal.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private modalService: ModalService) {
  }

  handleError(error) {
    this.modalService.showError(error.message, error.stack);

    // IMPORTANT: Rethrow the error otherwise it gets swallowed
    throw error;
  }

}
