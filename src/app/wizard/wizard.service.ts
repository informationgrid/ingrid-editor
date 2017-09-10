import {EventEmitter, Injectable} from '@angular/core';

@Injectable()
export class WizardService {

  focusElements$ = new EventEmitter();

  constructor() { }

}
