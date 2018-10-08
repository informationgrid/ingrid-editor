import {CanDeactivate} from '@angular/router';
import {DynamicFormComponent} from '../+form/dynamic-form.component';

export class FormChangeDeactivateGuard implements CanDeactivate<DynamicFormComponent> {

  canDeactivate(target: DynamicFormComponent) {
    if (target.form && target.form.dirty) {
      return window.confirm( 'Möchten Sie die Änderungen wirklich verwerfen?' );
    }
    return true;
  }
}