import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ModalService} from '../../services/modal/modal.service';
import {UserService} from '../../services/user/user.service';
import {FrontendUser, Permissions, User} from '../user';
import {Observable} from 'rxjs';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {RoleService} from '../../services/role/role.service';
import {FormBuilder, FormGroup} from '@angular/forms';

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
  @Output() canSave = new EventEmitter<boolean>();

  @ViewChild('loginRef') loginRef: ElementRef;

  users: User[];
  currentTab: string;
  form: FormGroup;

  selectedUser: FrontendUser;

  isNewUser = false;

  groups = this.groupService.getGroups();

  constructor(private modalService: ModalService,
              private fb: FormBuilder,
              private userService: UserService, private groupService: RoleService) {
  }

  ngOnInit() {
    this.currentTab = 'users';

    this.fetchUsers();

    this.form = this.fb.group({
      login: this.fb.control({value: '', disabled: true}),
      role: this.fb.control({value: '', disabled: true}),
      firstName: [],
      lastName: [],
      password: [],
      groups: this.fb.control([])
    });

    if (this.doSave) {
      this.doSave
        .pipe(untilDestroyed(this))
        .subscribe(() => this.saveUser());
    }

    if (this.doDelete) {
      this.doDelete
        .pipe(untilDestroyed(this))
        .subscribe(() => this.deleteUser(this.selectedUser.login));
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
          password: '',
          groups: [],
          role: 'Keiner Rolle zugeordnet'
        }, user);
        this.form.setValue(mergedUser);
        this.canSave.emit(true);
        console.log('selectedUser:', this.selectedUser);
      });
  }

  addUser() {
    this.isNewUser = true;
    this.selectedUser = new FrontendUser();
    this.canSave.emit(true);
    setTimeout(() => this.loginRef.nativeElement.focus(), 200);
  }

  deleteUser(login: string) {
    this.userService.deleteUser(login)
      .subscribe(() => {
          this.selectedUser = new FrontendUser();
          this.fetchUsers();
        },
        (err: any) => this.modalService.showJavascriptError(err, err.text())
      );
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
            this.modalService.showJavascriptError('Es existiert bereits ein Benutzer mit dem Login: ' + this.selectedUser.login);
          } else {
            this.modalService.showJavascriptError('Es existiert kein Benutzer mit dem Login: ' + this.selectedUser.login);
          }
        } else {
          throw err;
        }
      });
  }

}
