import {Injectable} from '@angular/core';
import {FormToolbarService} from '../../../+form/toolbar/form-toolbar.service';
import {Plugin} from '../../plugin';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowPlugin extends Plugin {
  id = 'plugin.workflow';
  name = 'Workflow';

  toolbarBtnId = 'toolBtnSendQA';
  subscription: Subscription;

  constructor(private formToolbarService: FormToolbarService) {
    super();
  }

  register() {
    super.register();

    this.formToolbarService.addButton( {
      id: this.toolbarBtnId, tooltip: 'Send to QA', cssClasses: 'glyphicon glyphicon-hand-right', pos: 140, eventId: 'SEND_TO_QA'
    } );

    this.subscription = this.formToolbarService.toolbarEvent$.subscribe( eventId => {
      if (eventId === 'SEND_TO_QA') {
        WorkflowPlugin.sendToQA();
      }
    } );

    // disable publish plugin / buttons

    // add button for send to QA (non-QA)
    // add button for publish (QA)
    // add button for reject (QA)

    // introduce new roles for QA and non-QA

    // add action for buttons

    // display state in tree/document
  }

  static sendToQA() {
    console.log( 'Send to QA' );
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton( this.toolbarBtnId );
    this.subscription.unsubscribe();
  }
}
