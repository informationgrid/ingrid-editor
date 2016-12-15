import {Component, OnInit, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {Modal} from 'ng2-modal';
import {ModalService} from '../services/modal/modal.service';
import {ErrorService} from '../services/error.service';
import {RoleService, Role} from './role.service';
import {MenuService} from '../menu/menu.service';
import {Observable} from 'rxjs';

@Component( {
  selector: 'role-gui',
  template: require( './role.component.html' )
} )
export class RoleComponent implements OnInit {

  @ViewChild( 'loginRef' ) loginRef: ElementRef;

  @Output() onRoleChange = new EventEmitter<Role[]>();

  private roles: Role[];
  private pages: any[];
  private selectedRole: Role = {};
  private dialogTab: string = 'dataset';

  private isNewRole: boolean = false;

  constructor(private modalService: ModalService,
              private roleService: RoleService,
              private menuService: MenuService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.fetchRoles();

    this.pages = this.menuService.menuItems;
    console.log('pages: ', this.pages);
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

  loadRole(role: Role) {
    this.isNewRole = false;
    this.roleService.getRole( role.id )
      .subscribe(
        role => {this.selectedRole = role; console.log('selectedRole: ', this.selectedRole);},
        error => this.errorService.handle( error )
      );
  }

  saveRole(role: Role) {
    let observer: Observable<any> = null;

    if (this.isNewRole) {
      observer = this.roleService.createRole(role);

    } else {
      observer = this.roleService.saveRole(role);

    }

    // send request and handle error
    observer.subscribe(
      () => {
        this.isNewRole = false;
        this.fetchRoles();
      }, (err: any) => {
        if (err.status === 406) {
          if (this.isNewRole) {
            this.modalService.showError('Es existiert bereits ein Benutzer mit dem Login: ' + this.selectedRole.name);
          } else {
            this.modalService.showError('Es existiert kein Benutzer mit dem Login: ' + this.selectedRole.name);
          }
        } else {
          this.modalService.showError(err, err.text());
        }
      });
  }

  deleteRole(role: Role) {
    this.roleService.deleteRole(role.id)
      .subscribe(
        () => {
          this.selectedRole = {};
          this.fetchRoles();
        },
        (err: any) => this.modalService.showError(err, err.text())
      );
  }

  createPermission(modal: Modal) {
    modal.close();
  }
}
