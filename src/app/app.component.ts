import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Modal} from 'ngx-modal';
import {ModalService} from './services/modal/modal.service';
import {BehaviourService} from './+behaviours/behaviour.service';

// enableProdMode();

@Component( {
  selector: 'app-root',
  template: `
    <div class="igeContainer">
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
    
    <!-- Placeholder for dynamically created dialogs from plugins -->
    <div #dialogContainer id="dialogContainer"></div>
  `,
  styles: [`
    .igeContainer { height: 100%; }
  `]
} )
export class AppComponent implements OnInit {

  @ViewChild( 'errorModal' ) errorModal: Modal;
  @ViewChild('dialogContainer', {read: ViewContainerRef}) dialogContainerRef: ViewContainerRef;

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
      const systemBehaviours = this.behaviourService.systemBehaviours;
      console.log( 'got system behaviours:', systemBehaviours );
      systemBehaviours
        .filter( systemBehaviour => systemBehaviour.isActive )
        .forEach( systemBehaviour => {
          console.log( 'register system behaviour: ' + systemBehaviour.name );
          systemBehaviour.register();
        } );
    } );
    this.modalService.containerRef = this.dialogContainerRef;
  }

}
