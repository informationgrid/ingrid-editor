import { Injectable } from '@angular/core';
import {ModalService} from "./modal/modal.service";
import {Observable} from "rxjs";

@Injectable()
export class ErrorService {

    constructor(private modalService: ModalService) { }

    handle(error) {
      // on logout or jwt expired
      if (error.status === 403) {
        console.log('Not logged in');
        this.router.navigate(['/login']);
      } else {
        console.error('Error: ', error);
        this.modalService.showError(error.toString(), error.text());
        return Observable.throw(error);
      }
    }
}