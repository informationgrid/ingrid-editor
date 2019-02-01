import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WizardService {

  focusElements$ = new EventEmitter();

  constructor() { }

}
