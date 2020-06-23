import {EventManager} from '@angular/platform-browser';
import {FormGroup} from '@angular/forms';
import {BaseBehaviour} from '../../base.behaviour';
import {DocumentService} from '../../../../services/document/document.service';
import {Inject} from '@angular/core';
import {Behaviour} from '../../../../services/behavior/behaviour';
/**
 * OpenDataBehaviour
 */
export class ClickAndChangeTitleBehaviour extends BaseBehaviour implements Behaviour {
  id = 'clickAndChangeTitle';
  title = 'Click and change title + onSave validator';
  description = '...';
  defaultActive = true;
  forProfile = 'UVP';

  constructor(@Inject(DocumentService) private documentService: DocumentService) {
    super();
  }

  register(form: FormGroup, eventManager: EventManager) {
    const taskEl = <HTMLElement>document.querySelector('#taskId');
    this.addListener(
      eventManager.addEventListener(taskEl, 'click', function () {
        console.log('Element was clicked');
        form.get(['mainInfo', 'title']).setValue('remotely updated by behaviour');
      })
    );

    this.addSubscriber(
      this.documentService.beforePublish$.subscribe((message: any) => {

        message.errors.push({id: 'taskId', error: 'I don\'t like this ID'});
        console.log('in observer');
      })
    );
  }
}
