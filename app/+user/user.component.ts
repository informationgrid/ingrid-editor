import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Split} from '../../node_modules/split.js/split';
import {Modal} from 'ng2-modal';
import {ModalService} from '../services/modal/modal.service';
import {UserService, User} from './user.service';
import {ErrorService} from "../services/error.service";
import {Observable} from "rxjs";

interface Role {
  id: number;
  name: string;
}

@Component({
  template: require('./user.component.html')
})
export class UserComponent implements OnInit, AfterViewInit {

  private users: User[];
  private roles: Role[];
  private currentTab: string;
  private dialogTab: string;
  private selectedUser: User = {};
  private selectedRole: User;
  private isNewUser: boolean = false;


  constructor(private modalService: ModalService, private userService: UserService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.currentTab = 'users';
    this.dialogTab = 'dataset';
    this.roles = [
      {id: -1, name: 'admin'},
      {id: -2, name: 'author'}
    ];

    this.fetchUsers();
    // this.userService.getRoles().subscribe( roles => this.roles = roles );
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

  loadUser(user: User) {
    console.log("user", user);
    this.isNewUser = false;
    this.userService.getUser(user.login)
      .subscribe(
        user => this.selectedUser = user,
        error => this.errorService.handle(error)
      )
  }

  addUser() {
    this.isNewUser = true;
    this.selectedUser = {};
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
            this.modalService.showError("Es existiert bereits ein Benutzer mit dem Login: " + this.selectedUser.login);
          } else {
            this.modalService.showError("Es existiert kein Benutzer mit dem Login: " + this.selectedUser.login);
          }
        } else {
          this.modalService.showError(err, err.text());
        }
      });
  }

  addRole() {
    this.modalService.showNotImplemented();
  }

  loadRole() {
    this.modalService.showNotImplemented();
  }

  createPermission(modal: Modal) {
    modal.close();
  }
}
