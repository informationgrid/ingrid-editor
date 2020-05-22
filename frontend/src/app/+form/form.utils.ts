import {DocumentService} from '../services/document/document.service';
import {FormGroup} from '@angular/forms';
import {FormToolbarService} from './form-shared/toolbar/form-toolbar.service';

export class FormUtils {
  static addHotkeys(event: KeyboardEvent, service: FormToolbarService) {
    if (event.ctrlKey && event.key === 's') { // CTRL + S (Save)
      console.log( 'SAVE' );
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      service.sendEvent('SAVE');
    }
  }
}
