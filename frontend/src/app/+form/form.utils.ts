import {DocumentService} from '../services/document/document.service';
import {FormGroup} from '@angular/forms';

export class FormUtils {
  addHotkeys(event: KeyboardEvent, service: DocumentService, form: FormGroup) {
    if (event.ctrlKey && event.keyCode === 83) { // CTRL + S (Save)
      console.log( 'SAVE' );
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      if (form) {
        service.save(form.value);
      }
    }
  }
}
