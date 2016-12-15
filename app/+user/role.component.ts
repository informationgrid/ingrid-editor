import {Component, OnInit, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {Modal} from 'ng2-modal';
import {ModalService} from '../services/modal/modal.service';
import {ErrorService} from '../services/error.service';
import {RoleService} from './role.service';

interface Role {
  id?: string;
  name?: string;
}

@Component( {
  selector: 'role-gui',
  template: require( './role.component.html' )
} )
export class RoleComponent implements OnInit {

  @ViewChild( 'loginRef' ) loginRef: ElementRef;

  @Output() onRoleChange = new EventEmitter<Role[]>();

  private roles: Role[];
  private selectedRole: Role = {};
  private dialogTab: string = 'dataset';

  private isNewRole: boolean = false;

  constructor(private modalService: ModalService,
              private roleService: RoleService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.fetchRoles();
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
        role => this.selectedRole = role,
        error => this.errorService.handle( error )
      );
  }

  createPermission(modal: Modal) {
    modal.close();
  }
}
