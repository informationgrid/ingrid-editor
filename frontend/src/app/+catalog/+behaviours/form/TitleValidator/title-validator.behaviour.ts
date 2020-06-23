import {BaseBehaviour} from '../../base.behaviour';
import {FormGroup, FormControl} from '@angular/forms';
import {EventManager} from '@angular/platform-browser';
import {Behaviour} from '../../../../services/behavior/behaviour';

/**
 * OpenDataBehaviour
 */
export class TitleValidatorBehaviour extends BaseBehaviour implements Behaviour {
  id = 'title-validator';
  title = 'Titel hat mindestens 3 Zeichen';
  description = '...';
  defaultActive = false;
  forProfile = 'UVP';

  constructor() {
    super();
  }

  register(form: FormGroup, eventManager: EventManager) {
    form.get('title').validator = function (fc: FormControl) {
      return fc.value && fc.value.length >= 3 ? null : {
        validateTop: {valid: false, error: 'Der Titel muss aus mindestens 3 Zeichen bestehen'}
      };
    };

    form.get('taskId').validator = function (fc: FormControl) {
      // TODO: the validator seems to be called for each created form field of the profile
      console.log('.');

      return (fc.value && fc.value.length > 0) ? null : {
        validateTop: {valid: false, error: 'Dieses Feld darf nicht leer sein.'}
      };
      // or use fc.pristine or !fc.touched initially?
    };
  }
}
