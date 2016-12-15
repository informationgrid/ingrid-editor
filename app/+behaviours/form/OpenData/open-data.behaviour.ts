import {Behaviour} from "../../+plugins/behaviours";
import {BaseBehaviour} from "../base.behaviour";
import {EventManager} from "@angular/platform-browser";
import {FormGroup} from "@angular/forms";
import {StorageService} from "../../services/storage/storage.service";
import {Inject} from "@angular/core";
/**
 * OpenDataBehaviour
 */
export class OpenDataBehaviour extends BaseBehaviour implements Behaviour {
  id = 'open-data';
  title = 'Open Data Behaviour';
  description = '...';
  defaultActive = true;
  forProfile = 'ISO';

  conformEl: HTMLElement = null;

  constructor(@Inject(StorageService) private storageService: StorageService) {
    super();
  }

  register(form: FormGroup, eventManager: EventManager) {
    console.debug( 'open data behaviour' );
    this.conformEl = this.getFieldContainer('[for=isConform]');

    this.addSubscriber(
      this.storageService.afterProfileSwitch$.subscribe( () => {
        console.debug( 'open data after profile switch' );
        this.handleState(form.controls['isOpenData'].value);
      })
    );

    this.addSubscriber(
      form.controls['isOpenData'].valueChanges.subscribe( (checked: boolean) => {
        console.debug( 'open data changed: ', checked );
        this.handleState(checked);
      } )
    );
  }

  getFieldContainer(query: string): HTMLElement {
    let parent = <HTMLElement> document.querySelector(query);
    while (parent && !parent.classList.contains('fieldContainer')) {
      parent = parent.parentElement;
    }
    return parent;
  }

  handleState(checked: boolean) {
    if (checked) {
      this.conformEl.classList.remove('hide');
    } else {
      this.conformEl.classList.add('hide');
    }
  }
}