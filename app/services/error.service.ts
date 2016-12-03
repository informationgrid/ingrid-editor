import { Injectable } from '@angular/core';
import {ModalService} from "./modal/modal.service";
import {Observable} from "rxjs";
import {Router} from "@angular/router";

@Injectable()
export class ErrorService {

    constructor(private modalService: ModalService, private router: Router) { }

    handle(error: any) {
      // on logout or jwt expired
      if (error.status === 403) {
        console.log('Not logged in');
        this.router.navigate(['/login']);
      } else {
        console.error('Error: ', error);
        let moreInfo = error.text ? error.text() : undefined;
        this.modalService.showError(error.toString(), moreInfo);
        return Observable.throw(error);
      }
    }
}