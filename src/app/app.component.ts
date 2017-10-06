import {Component, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {ModalService} from './services/modal/modal.service';
import {BehaviourService} from './+behaviours/behaviour.service';
import {RoleService} from './+user/role.service';
import {KeycloakService} from './keycloak/keycloak.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import { defineLocale } from 'ngx-bootstrap/bs-moment';
import { de } from 'ngx-bootstrap/locale';

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


    <ng-template #errorModal>
      <div class="modal-header">
        <h4 class="modal-title pull-left">Fehler</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="errorModalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>Es ist ein Fehler aufgetreten:</p>
        <p>{{dynDialog.errorMessage}}</p>
        <p>{{dynDialog.errorMessageMore}}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-link" (click)="errorModalRef.hide()">Schließen</button>
      </div>
    </ng-template>
    <!--<modal #errorModal modalClass="error" title="Fehler" submitButtonLabel="Ok" (onSubmit)="errorModal.close()">
        <modal-content>
            <p>Es ist ein Fehler aufgetreten:</p>
            <p class="text-danger">{{dynDialog.errorMessage}}</p>
            <p>{{dynDialog.errorMessageMore}}</p>
        </modal-content>
    </modal>-->

    <!-- Placeholder for dynamically created dialogs from plugins -->
    <div #dialogContainer id="dialogContainer"></div>
  `,
  styles: [`
    .igeContainer { height: 100%; overflow-x: hidden; }
  `]
} )
export class AppComponent implements OnInit {

  @ViewChild( 'errorModal' ) errorModal: TemplateRef<any>;
  @ViewChild('dialogContainer', {read: ViewContainerRef}) dialogContainerRef: ViewContainerRef;

  errorModalRef: BsModalRef;
  dynDialog: any = {errorMessage: ''};

  // TODO: modal zoom -> https://codepen.io/wolfcreativo/pen/yJKEbp/

  constructor(private bsModalService: BsModalService, private behaviourService: BehaviourService, private modalService: ModalService,
              private roleService: RoleService) {

    defineLocale('de', de);

    // TODO: make more error info collapsible
    this.modalService.errorDialog$.subscribe( (content: any) => {
      this.dynDialog.errorMessage = content.message;
      this.dynDialog.errorMessageMore = content.moreInfo;
      this.errorModalRef = this.bsModalService.show(this.errorModal, {class: 'modal-alert'});
    } );

    const roles = KeycloakService.auth.authz.resourceAccess['ige-ng'].roles;
    // TODO: get RoleMapping from each role so that we can give permissions in client correctly
    this.roleService.getRoleMapping('admin' )
      .subscribe(role => {
        console.log('my roles:', role);
        KeycloakService.auth.roleMapping.push(role);
      });

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
