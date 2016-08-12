import {EventManager} from '@angular/platform-browser';
import {FormGroup} from '@angular/forms';
import {FormularService} from '../../../../services/formular/formular.service';
import {Behaviour} from '../../../../services/behaviour/behaviours';
import {BaseBehaviour} from '../../../../behaviours/base.behaviour';
/**
 * OpenDataBehaviour
 */
export class MapAndChangeTitleBehaviour extends BaseBehaviour implements Behaviour {
  id = 'mapAndChangeTitle';
  title = 'Enter map and change title';
  description = '...';
  defaultActive = true;
  forProfile = 'UVP';

  constructor(private formService: FormularService) {
    super();
  }

  register(form: FormGroup, eventManager: EventManager) {
    this.addSubscriber(
      form.controls['map'].valueChanges.subscribe( function (val: string) {
        if (val === 'map') {
          form.get( ['mainInfo', 'title'] ).setValue( 'Map was entered' );
        }
      } )
    );
    this.addSubscriber(
      form.controls['categories'].valueChanges.subscribe( function (val: string) {
        console.log( 'categories changed: ', val );
      } )
    );
  }
}