import {CanDeactivate} from '@angular/router';
import {DynamicFormComponent} from '../+form/dynamic-form.component';
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class FormChangeDeactivateGuard implements CanDeactivate<DynamicFormComponent> {

  canDeactivate(target: DynamicFormComponent) {
    if (target.form && target.form.dirty) {
      return window.confirm( 'Möchten Sie die Änderungen wirklich verwerfen?' );
    }
    return true;
  }
}
