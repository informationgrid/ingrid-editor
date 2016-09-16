import {Behaviour} from "../../services/behaviour/behaviours";
import {EventManager} from "@angular/platform-browser";
import {FormGroup} from "@angular/forms";
import {BaseBehaviour} from "../base.behaviour";
import {StorageService} from "../../services/storage/storage.service";
import {Inject} from "@angular/core";
/**
 * OpenDataBehaviour
 */
export class ClickAndChangeTitleBehaviour extends BaseBehaviour implements Behaviour {
  id = 'clickAndChangeTitle';
  title = 'Click and change title + onSave validator';
  description = '...';
  defaultActive = true;
  forProfile = 'UVP';

  constructor(@Inject(StorageService) private storageService: StorageService) {
    super();
    console.log('behaviour constructor storageService:', storageService);
  }

  register(form: FormGroup, eventManager: EventManager) {
    let taskEl = <HTMLElement>document.querySelector('#taskId');
    this.addListener(
      eventManager.addEventListener(taskEl, 'click', function () {
        console.log('Element was clicked');
        form.get(['mainInfo', 'title']).setValue('remotely updated by behaviour');
      })
    );
    console.log('behaviour storageService:', this.storageService);
    // debugger;
    /*this.addSubscriber(
      this.storageService.beforeSave.asObservable().subscribe((message: any) => {
        message.errors.push({id: 'taskId', error: 'I don\'t like this ID'});
        console.log('in observer');
      })
    );*/
  }
}
