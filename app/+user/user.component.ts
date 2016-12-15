import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {Split} from '../../node_modules/split.js/split';
import {ModalService} from '../services/modal/modal.service';
import {UserService, User} from './user.service';
import {ErrorService} from '../services/error.service';
import {Observable} from 'rxjs';

interface Role {
  id?: string;
  name?: string;
}

@Component({
  template: require('./user.component.html')
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

  ngAfterViewInit(): void {
    Split(['#sidebarUser', '#formUser'], {
      gutterSize: 8,
      sizes: [25, 75],
      minSize: [200]
    });
    Split(['#sidebarRoles', '#formRoles'], {
      gutterSize: 8,
      sizes: [25, 75],
      minSize: [200]
    });
  }

  updateRoles(roles: Role[]) {
    this.roles = roles;
  }

  loadUser(user: User) {
    console.log('user', user);
    this.isNewUser = false;
    this.userService.getUser(user.login)
      .subscribe(
        user => this.selectedUser = user,
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
