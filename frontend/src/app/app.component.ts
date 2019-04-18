import {Component, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {ModalService} from './services/modal/modal.service';
import {BehaviourService} from './services/behavior/behaviour.service';
import {RoleService} from './services/role/role.service';
import {MatDialog} from '@angular/material';
import {MenuItem, MenuService} from "./menu/menu.service";
import {ApiService} from "./services/ApiService";

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
    
    /deep/ mat-drawer-content.mat-drawer-content {
      display: flex;
      flex-direction: column;
      flex: 1;
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

  routes: MenuItem[];

  // TODO: modal zoom -> https://codepen.io/wolfcreativo/pen/yJKEbp/

  constructor(private bsdialog: MatDialog, private behaviourService: BehaviourService, private modalService: ModalService,
              private apiService: ApiService,
              private roleService: RoleService, private menuService: MenuService) {

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

  logout() {
    this.apiService.logout().subscribe( () => {
      debugger;
      window.location.reload( true );
    })
  }

}
