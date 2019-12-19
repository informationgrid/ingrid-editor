import {Injectable} from '@angular/core';
import {FormMessageType} from '../+form/form-info/form-message/form-message.component';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  message$ = new Subject<FormMessageType>();

  constructor() { }

  sendInfo(message: string) {
    this.message$.next({
      severity: 'info',
      message
    });
  }

  sendError(message: string) {
    this.message$.next({
      severity: 'error',
      message
    });
  }

}
