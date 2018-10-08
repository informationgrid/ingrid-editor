import { Injectable } from '@angular/core';
import { ModalService } from './modal/modal.service';
import { Router } from '@angular/router';
import { throwError } from 'rxjs/index';

@Injectable()
export class ErrorService {

    constructor(private modalService: ModalService, private router: Router) { }

    handle(error: any) {
      // on logout or jwt expired
      if (error.status === 403) {
        console.log('Not logged in');
      } else {
        debugger;
        console.error('Error: ', error);
        const moreInfo = error.text ? error.text() : undefined;
        // this.modalService.showError(error.toString(), moreInfo);
        return throwError(error);
      }
    }

    handleOwn(msg: string, detail: any) {
      // debugger;
      // this.modalService.showError(msg, detail);
      return throwError(msg);
    }
}
