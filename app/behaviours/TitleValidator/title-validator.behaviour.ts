import { Behaviour } from '../../services/behaviour/behaviours';
import {BaseBehaviour} from '../base.behaviour';
import {EventManager} from "@angular/platform-browser";
import {FormGroup, FormControl} from "@angular/forms";
import {StorageService} from "../../services/storage/storage.service";
import {Inject} from "@angular/core";
/**
 * OpenDataBehaviour
 */
export class TitleValidatorBehaviour extends BaseBehaviour implements Behaviour {
  id = 'title-validator';
  title = 'Title must be "top"';
  description = '...';
  defaultActive = false;
  forProfile = 'ISO';

  constructor(@Inject(StorageService) private storageService: StorageService) {
    super();
  }

  register(form: FormGroup, eventManager: EventManager) {
    this.addSubscriber(
      this.storageService.afterProfileSwitch$.subscribe( () => {
        form.controls['title'].validator = function (fc: FormControl) {
          return fc.value === 'top' ? null : {
            validateTop: { valid: false, error: 'Text should be "top"' }
          };
        }
      })
    );
  }
}