import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ModalService} from '../../services/modal/modal.service';
import {RoleService} from '../../services/role/role.service';
import {MenuService} from '../../menu/menu.service';
import {Role} from '../../models/user-role';
import {TreeComponent} from '../../+form/sidebars/tree/tree.component';
import {Observable} from 'rxjs';

@Component({
  selector: 'ige-group-manager',
  templateUrl: './role.component.html'
})
export class RoleComponent implements OnInit {

  @Input() doSave: EventEmitter<void>;
  @Input() doDelete: EventEmitter<void>;

  @Output() canSave = new EventEmitter<boolean>();

  roles: Role[] = [];
  private pages: any[];
  selectedRole: Role; // = new Role();
  dialogTab = 'dataset';

  private isNewRole = false;
  permissions: any;

  constructor(private modalService: ModalService,
              private roleService: RoleService,
              private menuService: MenuService) {
  }

  ngOnInit() {
    this.fetchRoles();

    this.pages = this.menuService.mainRoutes.map(item => {
      return {
        id: item.path,
        name: item.data.title
      };
    });

    if (this.doSave) {
      this.doSave.subscribe(() => this.saveRole(this.selectedRole));
    }

    if (this.doDelete) {
      this.doDelete.subscribe(() => this.deleteRole(this.selectedRole));
    }
  }

  fetchRoles() {
    /*this.roleService.getRoles().subscribe(
      roles => {
        this.roles = roles;
        this.onRoleChange.next( roles );
      }
      // error => this.errorService.handleOwn('Problem fetching all roles', error)
    );*/
  }

  addRole() {
    this.isNewRole = true;
    this.selectedRole = new Role();
    this.canSave.next(true);
  }

  loadRole(roleToLoad: Role) {
    this.isNewRole = false;
    this.roleService.getRoleMapping(roleToLoad.name)
      .subscribe(
        role => {
          this.selectedRole = role;
          console.log('selectedRole: ', this.selectedRole);
        }
      );
  }

  saveRole(role: Role) {
    let observer: Observable<Role>;

    if (this.isNewRole) {
      observer = this.roleService.createRole(role);

    } else {
      observer = this.roleService.saveRole(role);

    }

    // send request and handle error
    observer.subscribe(
      () => {
        this.isNewRole = false;
        this.roles.push(this.selectedRole)
        // this.fetchRoles();
      }, (err: any) => {
        if (err.status === 406) {
          if (this.isNewRole) {
            this.modalService.showJavascriptError('Es existiert bereits ein Benutzer mit dem Login: ' + this.selectedRole.name);
          } else {
            this.modalService.showJavascriptError('Es existiert kein Benutzer mit dem Login: ' + this.selectedRole.name);
          }
        } else {
          this.modalService.showJavascriptError(err, err.text());
        }
      });
  }

  deleteRole(role: Role) {
    this.roleService.deleteRole(role.id)
      .subscribe(
        () => {
          this.selectedRole = null;
          this.fetchRoles();
        },
        (err: any) => this.modalService.showJavascriptError(err, err.text())
      );
  }

  createPermission(modal) {
    modal.hide();
  }
}
