import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ModalService} from '../../services/modal/modal.service';
import {UserService} from '../../services/user/user.service';
import {FrontendUser, User} from '../user';
import {Observable, Subject} from 'rxjs';
import {UntilDestroy} from '@ngneat/until-destroy';
import {GroupService} from '../../services/role/group.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {NewUserDialogComponent} from './new-user-dialog/new-user-dialog.component';
import {ConfirmDialogComponent, ConfirmDialogData} from '../../dialogs/confirm/confirm-dialog.component';
import {debounceTime, map, tap} from 'rxjs/operators';
import {dirtyCheck} from '@ngneat/dirty-check-forms';

@UntilDestroy()
@Component({
  selector: 'ige-user-manager',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {

  isDirty$: Observable<boolean>;
  state$ = new Subject<any>();

  @ViewChild('loginRef') loginRef: ElementRef;

  users: User[];
  admins: User[];
  ADMIN_ROLES = ["cat-admin", "md-admin", "admin", "superadmin"];
  currentTab: string;
  form: FormGroup;

  isNewUser = false;
  private isNewExternalUser = false;

  roles = this.userService.availableRoles;
  groups = this.groupService.getGroups();
  selectedUserForm = new FormControl();
  selectedUser: User;
  showMore = false;
  searchQuery: string;
  isLoading = false;

  constructor(private modalService: ModalService,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private userService: UserService, private groupService: GroupService) {
  }

  ngOnInit() {
    this.currentTab = 'users';

    this.fetchUsers();

    this.form = this.fb.group({
      login: this.fb.control({value: '', disabled: true}, Validators.required),
      role: this.fb.control({value: '', disabled: true}, Validators.required),
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      groups: this.fb.control([]),
      manager: this.fb.control([]),
      standin: this.fb.control([])
    });

    this.isDirty$ = dirtyCheck(this.form, this.state$, {debounce: 100})
      // add debounceTime with same as in dirtyCheck to prevent save button flicker
      .pipe(debounceTime(100));
  }

  fetchUsers() {
    const currentValue = this.selectedUserForm.value;

    this.userService.getUsers()
      // .pipe(tap(users => users.filter(u => u.login === this.selectedUser.value.login)))
      .pipe(
        map((users: FrontendUser[]) => users.sort((a, b) => a.login.localeCompare(b.login))),
        tap(users => this.users = users ? users : []),
        tap(() => this.admins = this.users.filter(u => u.role ? this.ADMIN_ROLES.includes(u.role) : false)),
        tap(() => setTimeout(() => this.selectedUserForm.setValue(currentValue)))
      )
      .subscribe();
  }

  loadUser(login: string) {
    this.isLoading = true;
    this.isNewUser = false;
    this.form.disable();
    this.userService.getUser(login)
      .subscribe(user => {
        this.selectedUser = user;
        this.updateUserForm(user);
      });
  }

  private updateUserForm(user: FrontendUser) {
    const mergedUser = Object.assign({
      email: '',
      groups: [],
      role: 'Keiner Rolle zugeordnet'
    }, user);
    this.form.enable();
    this.form.get('login').disable();
    this.form.get('role').disable();
    this.form.reset(mergedUser);
    this.state$.next(mergedUser);
    this.isLoading=false;
  }

  showExternalUsersDialog() {
    this.dialog.open(NewUserDialogComponent)
      .afterClosed().subscribe(result => {
      if (result) {
        this.form.get('login').disable();
        this.form.get('role').disable();
        this.isNewExternalUser = false;

        this.addUser(result);
      }
    });
  }

  initNewKeycloakUser() {
    this.form.get('login').enable();
    this.form.get('role').enable();
    this.isNewExternalUser = true;

    this.addUser({});
  }

  private addUser(initial: any) {
    const newUser = initial.user ?? {groups: [], manager: 'TODO'};
    newUser.role = initial.role ?? '';
    this.isNewUser = true;
    this.form.reset(newUser);
    this.state$.next(newUser);
    setTimeout(() => this.loginRef.nativeElement.focus(), 300);
  }

  deleteUser(login: string) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Benutzer löschen',
        message: 'Möchten Sie den Benutzer ' + login + ' wirklich löschen?'
      } as ConfirmDialogData
    }).afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(login)
          .subscribe(() => this.fetchUsers());
      }
    });
  }

  saveUser() {
    let observer: Observable<User>;

    // convert roles to numbers
    // user.roles = user.roles.map(role => +role);
    this.form.disable();

    const user = this.form.getRawValue();
    if (this.isNewUser) {
      observer = this.userService.createUser(user, this.isNewExternalUser);

    } else {
      observer = this.userService.updateUser(user);

    }

    // send request and handle error
    observer.subscribe(
      () => {
        this.isNewUser = false;
        this.fetchUsers();
        this.form.enable();
      }, (err: any) => {
        this.form.enable();
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

  toggleMoreInfo() {
    this.showMore = !this.showMore;
  }

  getEmailErrorMessage() {
    const email = this.form.get('email');
    if (email.hasError('required')) {
      return 'Es wird eine Email-Adresse benötigt';
    }

    return email.hasError('email') ? 'Keine gültige Email-Adresse' : '';
  }

  onSearchChange(searchValue: string): void {
    this.searchQuery = searchValue;
  }

  getRoleIcon(role: string) {
    switch (true) {
      case role === 'ige-super-admin':
      case role === 'cat-admin':
        return 'catalog-admin'
      case role.includes('admin'):
        return 'meta-admin'
      default:
        return 'author'

    }
  }
}
