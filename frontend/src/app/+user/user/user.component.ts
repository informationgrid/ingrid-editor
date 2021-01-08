import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ModalService} from '../../services/modal/modal.service';
import {UserService} from '../../services/user/user.service';
import {FrontendUser, Permissions, User} from '../user';
import {Observable} from 'rxjs';

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
export class UserComponent implements OnInit, AfterViewInit {

  @Input() doSave: EventEmitter<void>;
  @Input() doDelete: EventEmitter<void>;
  @Output() canSave = new EventEmitter<boolean>();

  @ViewChild('loginRef') loginRef: ElementRef;

  users: User[];
  currentTab: string;

  selectedUser: FrontendUser;

  isNewUser = false;

  show = false;

  constructor(private modalService: ModalService, private userService: UserService) {
  }

  ngOnInit() {
    this.currentTab = 'users';

    this.fetchUsers();

    if (this.doSave) {
      this.doSave.subscribe(() => this.saveUser(this.selectedUser));
    }

    if (this.doDelete) {
      this.doDelete.subscribe(() => this.deleteUser(this.selectedUser.login));
    }
  }

  fetchUsers() {
    this.userService.getUsers().subscribe(
      users => this.users = users ? users : []
      // error => this.errorService.handleOwn('Problem fetching all user', error)
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.show = true;
    }, 0);
  }

  loadUser(userToLoad: User) {
    console.log('user', userToLoad);
    this.isNewUser = false;
    this.userService.getUser(userToLoad.login)
      .subscribe(user => {
        this.selectedUser = user;
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

  saveUser(user: User) {
    console.log('Save user', user);
    let observer: Observable<User>;

    // convert roles to numbers
    // user.roles = user.roles.map(role => +role);

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

  onSubmit() {

  }

  updatePermissions(permissions: Permissions) {
    this.selectedUser.permissions = permissions;
    this.selectedUser = {...this.selectedUser};
  }
}
