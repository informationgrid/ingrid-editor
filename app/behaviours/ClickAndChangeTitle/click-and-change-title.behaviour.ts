import {Behaviour} from '../../services/behaviour/behaviours';
import {EventManager} from '@angular/platform-browser';
import {FormGroup} from '@angular/forms';
import {FormularService} from '../../services/formular/formular.service';
import {BaseBehaviour} from '../base.behaviour';
/**
 * OpenDataBehaviour
 */
export class ClickAndChangeTitleBehaviour extends BaseBehaviour implements Behaviour {
  id = 'clickAndChangeTitle';
  title = 'Click and change title + onSave validator';
  description = '...';
  defaultActive = true;
  forProfile = 'UVP';

  constructor(private formService: FormularService) {
    super();
  }

  register(form: FormGroup, eventManager: EventManager) {
    let taskEl = <HTMLElement>document.querySelector( '#taskId' );
    this.addListener(
      eventManager.addEventListener( taskEl, 'click', function () {
        console.log( 'Element was clicked' );
        form.get( ['mainInfo', 'title'] ).setValue( 'remotely updated by behaviour' );
      } )
    );

    this.addSubscriber(
      this.formService.beforeSave.asObservable().subscribe( (message: any) => {
        message.errors.push( {id: 'taskId', error: 'I don\'t like this ID'} );
        console.log( 'in observer' );
      } )
    );
  }
}
