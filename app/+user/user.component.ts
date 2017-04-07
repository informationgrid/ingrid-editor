import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {ModalService} from '../services/modal/modal.service';
import {UserService, User} from './user.service';
import {ErrorService} from '../services/error.service';
import {Observable} from 'rxjs';
import {IMultiSelectSettings} from './multi-select.component';

interface Role {
  id?: string;
  name?: string;
}

@Component({
  template: require('./user.component.html'),
  styles: [`
    .userTabContainer, .roleTabContainer {
      position: absolute;
      top: 93px;
      bottom: 0px;
    }
  `]
})
export class UserComponent implements OnInit, AfterViewInit {

  @ViewChild('loginRef') loginRef: ElementRef;

  private users: User[];
  private roles: Role[];
  private currentTab: string;

  private selectedUser: User = {};

  private isNewUser: boolean = false;

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
      error => this.errorService.handle(error)
    );
  }

  ngAfterViewInit(): void {}

  updateRoles(roles: Role[]) {
    this.roles = roles;
  }

  loadUser(user: User) {
    console.log('user', user);
    this.isNewUser = false;
    this.userService.getUser(user.login)
      .subscribe(
        user => { this.selectedUser = user; console.log('selectedUser:', this.selectedUser); },
        error => this.errorService.handle(error)
      );
  }

  addUser() {
    this.isNewUser = true;
    this.selectedUser = {};
    setTimeout(() => this.loginRef.nativeElement.focus(), 200);
  }

  deleteUser(login: string) {
    this.userService.deleteUser(login)
      .subscribe(
        () => {
          this.selectedUser = {};
          this.fetchUsers();
        },
        (err: any) => this.modalService.showError(err, err.text())
      );
  }

  saveUser(user: User) {
    let observer: Observable<any> = null;

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

}
