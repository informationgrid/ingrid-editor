import {Component, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {ModalService} from './services/modal/modal.service';
import {BehaviourService} from './services/behavior/behaviour.service';
import {RoleService} from './services/role/role.service';
import {MatDialog} from '@angular/material/dialog';
import {MenuItem, MenuService} from "./menu/menu.service";
import {ApiService} from "./services/ApiService";
import {ConfigService} from './services/config/config.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'ige-root',
  templateUrl: './app.component.html',
  styles: [`
      :host {
          display: block;
          width: 100%;
          height: 100%;
      }

      .fillVertical {
          flex: 1;
      }

      .wrapper {
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
      }

      /deep/ mat-drawer-content.mat-drawer-content {
          display: flex;
          flex-direction: column;
          flex: 1;
      }

      /*.header-row {
          line-height: 48px;
          font-size: 23px;
      }


      ige-search-bar {
          float: right;
      }*/

      .mat-list-base {
          padding-top: 0;
      }

      mat-drawer {
          /*min-width: 400px;*/
          background-color: #28225b;
      }

      .mat-list-base .mat-list-item {
          color: #ffffff;
          height: 55px;
      }

      .mat-list-item.active {
          background-color: #196ea2;
          /*background-color: #f48829;*/
      }

      .mat-toolbar-row, .mat-toolbar-single-row, .mat-toolbar-multiple-rows {
          height: 44px;
          min-height: 44px;
      }
  `]
})
export class AppComponent implements OnInit {

  @ViewChild('errorModal', {static: true}) errorModal: TemplateRef<any>;
  @ViewChild('dialogContainer', {read: ViewContainerRef, static: true}) dialogContainerRef: ViewContainerRef;

  routes: MenuItem[];

  showDrawer: Observable<boolean>;
  username: Observable<string>;
  menuIsExpanded = true;

  // TODO: modal zoom -> https://codepen.io/wolfcreativo/pen/yJKEbp/

  constructor(private bsdialog: MatDialog, private behaviourService: BehaviourService, private modalService: ModalService,
              private apiService: ApiService, private configService: ConfigService,
              private roleService: RoleService, private menuService: MenuService) {

    // const roles = KeycloakService.auth.authz.resourceAccess['ige-ng'].roles;
    // TODO: get RoleMapping from each role so that we can give permissions in client correctly
    this.roleService.getRoleMapping('admin')
      .subscribe(role => {
        console.log('my roles:', role);
        // KeycloakService.auth.roleMapping.push(role);
      });

    // display the drawer if the user has at least one catalog assigned
    this.showDrawer = this.configService.$userInfo.pipe(
      map(info => info.assignedCatalogs.length > 0)
    );
    this.username = this.configService.$userInfo.pipe(
      map(info => info.name)
    );

  }

  ngOnInit() {

    this.menuService.menu$.subscribe(() => {
      console.log('menu has changed');
      this.routes = this.menuService.menuItems;
    });

    this.behaviourService.initialized.then(() => {
      const systemBehaviours = this.behaviourService.systemBehaviours;
      console.log('got system behaviours:', systemBehaviours);
      systemBehaviours
        .filter(systemBehaviour => systemBehaviour.isActive)
        .forEach(systemBehaviour => {
          console.log('register system behaviour: ' + systemBehaviour.name);
          systemBehaviour.register();
        });
    });
    this.modalService.containerRef = this.dialogContainerRef;
  }

  logout() {
    this.apiService.logout().subscribe(() => {
      debugger;
      window.location.reload(true);
    })
  }

}
