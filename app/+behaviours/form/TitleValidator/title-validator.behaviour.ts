import {BaseBehaviour} from '../../base.behaviour';
import {Behaviour} from '../../behaviours';
import {FormGroup, FormControl} from '@angular/forms';
import {EventManager} from '@angular/platform-browser';

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
    form.get('mainInfo.title').validator = function (fc: FormControl) {
      return fc.value && fc.value.length >= 3 ? null : {
        validateTop: {valid: false, error: 'Der Titel muss aus mindestens 3 Zeichen bestehen'}
      };
    };
  }
}