import { Injectable } from '@angular/core';
import { ModalService } from './modal/modal.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ErrorService {

    constructor(private modalService: ModalService, private router: Router) { }

    handle(error: any) {
      // on logout or jwt expired
      if (error.status === 403) {
        console.log('Not logged in');
      } else {
        console.error('Error: ', error);
        const moreInfo = error.text ? error.text() : undefined;
        this.modalService.showError(error.toString(), moreInfo);
        return Observable.throw(error);
      }
    }

    handleOwn(msg: string, detail: any) {
      this.modalService.showError(msg, detail);
      return Observable.throw(msg);
    }
}
