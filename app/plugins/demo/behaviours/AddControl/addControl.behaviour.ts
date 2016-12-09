import {EventManager} from '@angular/platform-browser';
import {FormGroup} from '@angular/forms';
import {FormularService} from '../../../../services/formular/formular.service';
import {Behaviour} from '../../../../services/behaviour/behaviours';
import {BaseBehaviour} from '../../../../behaviours/base.behaviour';
import {TextboxField} from '../../../../+form/controls/field-textbox';
/**
 * Add Control Behaviour
 */
export class AddControlBehaviour extends BaseBehaviour implements Behaviour {
  id = 'addControl';
  title = 'Neues Feld hinzufügen';
  description = 'Fügt ein neues Eingabefeld hinzu.';
  defaultActive = true;
  forProfile = 'UVP';

  controls = [
    new TextboxField( {
      key: 'behaviourField',
      label: 'Dynamic Behaviour Field',
      order: 3
    } )
  ];

  constructor(private formService: FormularService) {
    super();
  }

  register(form: FormGroup, eventManager: EventManager) {}


}