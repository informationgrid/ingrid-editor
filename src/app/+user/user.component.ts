import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ModalService} from '../services/modal/modal.service';
import {UserService} from './user.service';
import {ErrorService} from '../services/error.service';
import {User} from './user';
import {Role} from '../models/user-role';
import { Observable } from 'rxjs/Observable';

@Component({
  templateUrl: './user.component.html',
  styles: [`
    .userTabContainer, .roleTabContainer {
      position: absolute;
      top: 98px;
      bottom: 0;
      left: 0;
      right: 0;
    }
  `]
})
export class UserComponent implements OnInit, AfterViewInit {

  @ViewChild('loginRef') loginRef: ElementRef;

  users: User[];
  roles: Role[];
  currentTab: string;

  selectedUser: User = new User();

  isNewUser = false;

  constructor(private modalService: ModalService, private userService: UserService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.currentTab = 'users';

    this.fetchUsers();
  }

  fetchUsers() {
    this.userService.getUsers().subscribe(
      users => this.users = users,
      error => this.errorService.handleOwn('Problem fetching all user', error)
    );
  }

  ngAfterViewInit(): void {}

  updateRoles(roles: Role[]) {
    this.roles = roles;
  }

  loadUser(userToLoad: User) {
    console.log('user', userToLoad);
    this.isNewUser = false;
    this.userService.getUser(userToLoad.id)
      .subscribe(
        user => { this.selectedUser = user; console.log('selectedUser:', this.selectedUser); },
        error => this.errorService.handle(error)
      );
  }

  addUser() {
    this.isNewUser = true;
    this.selectedUser = null;
    setTimeout(() => this.loginRef.nativeElement.focus(), 200);
  }

  deleteUser(login: string) {
    this.userService.deleteUser(login)
      .subscribe(
        () => {
          this.selectedUser = null;
          this.fetchUsers();
        },
        (err: any) => this.modalService.showError(err, err.text())
      );
  }

  saveUser(user: User) {
    let observer: Observable<User> = null;

    // convert roles to numbers
    user.roles = user.roles.map( role => +role );

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
            this.modalService.showError('Es existiert bereits ein Benutzer mit dem Login: ' + this.selectedUser.login);
          } else {
            this.modalService.showError('Es existiert kein Benutzer mit dem Login: ' + this.selectedUser.login);
          }
        } else {
          this.modalService.showError(err, err.text());
        }
      });
  }

  onSubmit() {

  }

}
