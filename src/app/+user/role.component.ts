import {Component, OnInit, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {ModalService} from '../services/modal/modal.service';
import {ErrorService} from '../services/error.service';
import {RoleService} from './role.service';
import {MenuService} from '../menu/menu.service';
import {Role, RoleAttribute} from '../models/user-role';
import {MetadataTreeComponent} from '../+form/sidebars/tree/tree.component';
import {BsModalRef} from 'ngx-bootstrap';
import { Observable } from 'rxjs/Observable';

@Component( {
  selector: 'role-gui',
  templateUrl: './role.component.html'
} )
export class RoleComponent implements OnInit {

  @ViewChild( 'loginRef' ) loginRef: ElementRef;
  @ViewChild( 'datasetTree' ) datasetTree: MetadataTreeComponent;

  @Output() onRoleChange = new EventEmitter<Role[]>();

  roles: Role[];
  private pages: any[];
  selectedRole = new Role();
  dialogTab = 'dataset';

  private isNewRole = false;
  private markForSelection: any[] = [];

  constructor(private modalService: ModalService,
              private roleService: RoleService,
              private menuService: MenuService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.fetchRoles();

    this.pages = this.menuService.menuItems.map( item => {
      return {
        id: item.path,
        name: item.name
      };
    } );
    console.log( 'pages: ', this.pages );
  }

  fetchRoles() {
    this.roleService.getRoles().subscribe(
      roles => {
        this.roles = roles;
        this.onRoleChange.next( roles );
      },
      error => this.errorService.handle( error )
    );
  }

  addRole() {
    this.modalService.showNotImplemented();
  }

  loadRole(roleToLoad: Role) {
    this.isNewRole = false;
    this.roleService.getRoleMapping( roleToLoad.name )
      .subscribe(
        role => {
          this.selectedRole = role;
          console.log( 'selectedRole: ', this.selectedRole );
        },
        error => this.errorService.handle( error )
      );
  }

  saveRole(role: Role) {
    let observer: Observable<Role> = null;

    if (this.isNewRole) {
      observer = this.roleService.createRole( role );

    } else {
      observer = this.roleService.saveRole( role );

    }

    // send request and handle error
    observer.subscribe(
      () => {
        this.isNewRole = false;
        this.fetchRoles();
      }, (err: any) => {
        if (err.status === 406) {
          if (this.isNewRole) {
            this.modalService.showError( 'Es existiert bereits ein Benutzer mit dem Login: ' + this.selectedRole.name );
          } else {
            this.modalService.showError( 'Es existiert kein Benutzer mit dem Login: ' + this.selectedRole.name );
          }
        } else {
          this.modalService.showError( err, err.text() );
        }
      } );
  }

  rememberSelection(selection) {
    this.markForSelection = selection;
  }

  addDataset(id: string) {
    this.selectedRole.datasets.push( ...this.markForSelection );
  }

  addAttribute(key: string, value: string) {
    this.selectedRole.attributes.push( {
      id: key,
      value: value
    } );
  }

  removeDataset(id: string): void {
    const pos = this.selectedRole.datasets.indexOf( id );
    this.selectedRole.datasets.splice( pos, 1 );
  }

  removeAttribute(attribute: RoleAttribute): void {
    const pos = this.selectedRole.attributes.indexOf( attribute );
    this.selectedRole.attributes.splice( pos, 1 );
  }

  deleteRole(role: Role) {
    this.roleService.deleteRole( role.id )
      .subscribe(
        () => {
          this.selectedRole = null;
          this.fetchRoles();
        },
        (err: any) => this.modalService.showError( err, err.text() )
      );
  }

  createPermission(modal: BsModalRef) {
    modal.hide();
  }
}
