import {EventManager} from '@angular/platform-browser';
import {FormGroup} from '@angular/forms';
import {FormularService} from '../../../../services/formular/formular.service';
import {Behaviour} from '../../../../services/behaviour/behaviours';
import {BaseBehaviour} from '../../../../behaviours/base.behaviour';
import {TextboxField} from '../../../../form/controls/field-textbox';
/**
 * Add Control Behaviour
 */
export class AddControlBehaviour extends BaseBehaviour implements Behaviour {
  id = 'addControl';
  title = 'Add control to form';
  description = '...';
  defaultActive = true;
  forProfile = 'UVP';

  controls = [
    new TextboxField( {
      key: 'behaviourField',
      label: 'Dynamic Behaviour Field',
      order: 0
    } )
  ];

  constructor(private formService: FormularService) {
    super();
  }

  register(form: FormGroup, eventManager: EventManager) {}


}