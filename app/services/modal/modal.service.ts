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

  showError(message: string) {
    this.errorDialog.next({
      message: message
    })
  }

  showNotImplemented() {
    this.showError('Diese Funktion ist noch nicht implementiert!');
  }
}