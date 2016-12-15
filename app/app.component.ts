import {Component, OnInit, ViewChild} from '@angular/core';
import {StatisticPlugin} from './+behaviours/system/statistic/statistic.plugin';
import {WorkflowPlugin} from './+behaviours/system/workflow/workflow.plugin';
import {DemoPlugin} from './+behaviours/system/demo/demo.plugin';
import {Modal} from 'ng2-modal';
import {ModalService} from './services/modal/modal.service';
import {BehaviourService} from './+behaviours/behaviour.service';

// enableProdMode();

@Component( {
  selector: 'my-app',
  template: `
    <div>
      <!-- MENU -->
      <main-menu></main-menu>
      
      <help-panel></help-panel>
      
      <!-- PAGES -->
      <router-outlet></router-outlet>
      
      <!-- TEST -->
      <!--<button (click)="addMenuItem('dynamic Item')">Add menu item</button>-->
    </div>
    
    
    <modal #errorModal modalClass="error" title="Fehler" submitButtonLabel="Ok" (onSubmit)="errorModal.close()">
        <modal-content>
            <p>Es ist ein Fehler aufgetreten:</p>
            <p class="text-danger">{{dynDialog.errorMessage}}</p>
            <p>{{dynDialog.errorMessageMore}}</p>
        </modal-content>
    </modal>
  `,
  providers: [StatisticPlugin, WorkflowPlugin, DemoPlugin],
  entryComponents: []
} )
export class AppComponent implements OnInit {

  @ViewChild( 'errorModal' ) errorModal: Modal;

  dynDialog: any = {errorMessage: ''};

  constructor(private behaviourService: BehaviourService, private modalService: ModalService) {

    // TODO: make more error info collapsible
    this.modalService.errorDialog$.subscribe( (content: any) => {
      this.dynDialog.errorMessage = content.message;
      this.dynDialog.errorMessageMore = content.moreInfo;
      this.errorModal.open();
    } );
  }

  ngOnInit() {
    this.behaviourService.initialized.then( () => {
      let systemBehaviours = this.behaviourService.systemBehaviours;
      console.log( 'got system behaviours:', systemBehaviours );
      systemBehaviours
        .filter( systemBehaviour => systemBehaviour.isActive )
        .forEach( systemBehaviour => {
          console.log( 'register system behaviour: ' + systemBehaviour.name );
          systemBehaviour.register();
        } );
    } );
  }

}
