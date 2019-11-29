import {FormularService} from './formular.service';

export class FormUtils {
  addHotkeys(event: KeyboardEvent, service: FormularService, form, model) {
    if (event.ctrlKey && event.keyCode === 83) { // CTRL + S (Save)
      console.log( 'SAVE' );
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      if (form) {
        service.save(form, model);
      }
    }
  }
}
