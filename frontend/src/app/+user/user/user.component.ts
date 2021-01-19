import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ModalService} from '../../services/modal/modal.service';
import {UserService} from '../../services/user/user.service';
import {User} from '../user';
import {Observable} from 'rxjs';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {RoleService} from '../../services/role/role.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {NewUserDialogComponent} from './new-user-dialog/new-user-dialog.component';
import {ConfirmDialogComponent} from '../../dialogs/confirm/confirm-dialog.component';

@UntilDestroy()
@Component({
  selector: 'ige-user-manager',
  templateUrl: './user.component.html',
  styles: [`
    #formUser form {
      padding: 20px;
    }

    ::ng-deep .mat-tab-group, ::ng-deep .mat-tab-body-wrapper {
      flex: 1;
    }
  `]
})
export class UserComponent implements OnInit {

  @Input() doSave: EventEmitter<void>;
  @Input() doDelete: EventEmitter<void>;
  @Output() canSave = new EventEmitter<FormGroup>();

  @ViewChild('loginRef') loginRef: ElementRef;

  users: User[];
  currentTab: string;
  form: FormGroup;

  isNewUser = false;

  roles = this.userService.availableRoles;
  groups = this.groupService.getGroups();

  constructor(private modalService: ModalService,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private userService: UserService, private groupService: RoleService) {
  }

  ngOnInit() {
    this.currentTab = 'users';

    this.fetchUsers();

    this.form = this.fb.group({
      login: this.fb.control({value: '', disabled: true}, Validators.required),
      role: this.fb.control({value: '', disabled: true}, Validators.required),
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      groups: this.fb.control([])
    });
    this.canSave.emit(this.form);

    if (this.doSave) {
      this.doSave
        .pipe(untilDestroyed(this))
        .subscribe(() => this.saveUser());
    }

    if (this.doDelete) {
      this.doDelete
        .pipe(untilDestroyed(this))
        .subscribe(() => this.deleteUser(this.form.getRawValue().login));
    }
  }

  fetchUsers() {
    this.userService.getUsers().subscribe(
      users => this.users = users ? users : []
    );
  }

  loadUser(userToLoad: User) {
    console.log('user', userToLoad);
    this.isNewUser = false;
    this.userService.getUser(userToLoad.login)
      .subscribe(user => {
        const mergedUser = Object.assign({
          email: '',
          groups: [],
          role: 'Keiner Rolle zugeordnet'
        }, user);
        this.form.setValue(mergedUser);
        // this.canSave.emit(true);
      });
  }

  showNewUserDialog() {
    this.dialog.open(NewUserDialogComponent)
      .afterClosed().subscribe(result => {
      if (result) {
        this.form.get('login').disable();
        this.form.get('role').disable();

        this.addUser(result);
      }
    });
  }

  initNewKeycloakUser() {
    this.form.get('login').enable();
    this.form.get('role').enable();

    this.addUser({});
  }

  private addUser(initial: any) {
    const newUser = initial.user ?? {groups: []};
    newUser.role = initial.role ?? '';
    this.isNewUser = true;
    this.form.reset();
    this.form.patchValue(newUser);
    // this.canSave.emit(true);
    setTimeout(() => this.loginRef.nativeElement.focus(), 300);
  }

  deleteUser(login: string) {
    this.userService.deleteUser(login)
      .subscribe(() => {
        this.fetchUsers();
      });
  }

  saveUser() {
    let observer: Observable<User>;

    // convert roles to numbers
    // user.roles = user.roles.map(role => +role);

    const user = this.form.getRawValue();
    if (this.isNewUser) {
      observer = this.userService.createUser(user);

    } else {
      observer = this.userService.saveUser(user);

    }

    // send request and handle error
    observer.subscribe(
      () => {
        this.isNewUser = false;
        this.fetchUsers();
      }, (err: any) => {
        if (err.status === 406) {
          if (this.isNewUser) {
            this.modalService.showJavascriptError('Es existiert bereits ein Benutzer mit dem Login: ' + this.form.value.login);
          } else {
            this.modalService.showJavascriptError('Es existiert kein Benutzer mit dem Login: ' + this.form.value.login);
          }
        } else {
          throw err;
        }
      });
  }

  changePassword() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Passwortänderung anfordern',
        message: 'Möchten Sie dem Benutzer eine Email mit der Aufforderung das Passwort zu ändern, zukommen lassen?'
      }
    })
      .afterClosed().subscribe(response => {
      if (response) {
        this.userService.sendPasswordChangeRequest(this.form.getRawValue().login)
          .subscribe();
      }
    });
  }
}
