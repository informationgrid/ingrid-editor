import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalService } from './services/modal/modal.service';
import { BehaviourService } from './services/behavior/behaviour.service';
import { RoleService } from './services/role/role.service';
import { MatDialog } from '@angular/material';
import {MenuItem, MenuService} from "./menu/menu.service";

@Component( {
  selector: 'ige-root',
  templateUrl: './app.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      /*display: block;*/
      /*padding-top: 56px;*/
      /*font-size: 85%;*/
    }
    ige-search-bar {
      float: right;
    }
    /*.igeContainer { height: 100%; overflow-x: hidden; }*/
    /*.modal-body { overflow: auto; }*/
  `]
} )
export class AppComponent implements OnInit {

  @ViewChild( 'errorModal' ) errorModal: TemplateRef<any>;
  @ViewChild('dialogContainer', {read: ViewContainerRef}) dialogContainerRef: ViewContainerRef;

  errorModalIsActive = false;
  dynDialogMessages: any = [];
  private routes: MenuItem[];

  // TODO: modal zoom -> https://codepen.io/wolfcreativo/pen/yJKEbp/

  constructor(private bsdialog: MatDialog, private behaviourService: BehaviourService, private modalService: ModalService,
              private roleService: RoleService, private menuService: MenuService) {

    // TODO: make more error info collapsible
    // this.modalService.errorDialog$.subscribe( (content: any) => {
      // if (this.errorModalRef) {
      //   this.dynDialogMessages.push( { msg: content.message, detail: content.moreInfo } );
      // } else {
      //   this.dynDialogMessages = [ { msg: content.message, detail: content.moreInfo } ];
        // TODO: this.errorModalRef = this.bsModalService.show(this.errorModal, {class: 'modal-alert modal-lg'});

        // conflict with onHide, which waits for backdrop animation until event is called
        // setTimeout( _ => this.errorModalIsActive = true, 500 );
      // }
    // } );

    // reset reference of dialog when dialog is closed
    /*this.bsModalService.onHide.subscribe( _ => {
      if (this.errorModalIsActive) {
        this.errorModalRef = null;
        this.errorModalIsActive = false;
      }*/
    // } );

    // const roles = KeycloakService.auth.authz.resourceAccess['ige-ng'].roles;
    // TODO: get RoleMapping from each role so that we can give permissions in client correctly
    this.roleService.getRoleMapping('admin' )
      .subscribe(role => {
        console.log('my roles:', role);
        // KeycloakService.auth.roleMapping.push(role);
      });

  }

  ngOnInit() {

    this.menuService.menu$.subscribe(() => {
      console.log('menu has changed');
      this.routes = this.menuService.menuItems;
    });

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
