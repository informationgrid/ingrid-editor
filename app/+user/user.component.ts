import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Split} from '../../node_modules/split.js/split';
import {Modal} from 'ng2-modal';
import {ModalService} from '../services/modal/modal.service';
import {UserService} from './user.service';
import {ErrorService} from "../services/error.service";

interface User {
  id: string;
  name: string;
}
interface Role {
  id: string;
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
  private selectedUser: User;
  private selectedRole: User;


  constructor(private modalService: ModalService, private userService: UserService,
    private errorService: ErrorService) {
  }

  ngOnInit() {
    this.currentTab = 'users';
    this.dialogTab = 'dataset';
    this.roles = [
      {id: '1', name: 'admin'},
      {id: '2', name: 'manager'},
      {id: '3', name: 'author'}
    ];

    this.userService.getUsers().subscribe(
      users => this.users = users,
      error => this.errorService.handle(error)
    );
    // this.userService.getRoles().subscribe( roles => this.roles = roles );
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
    this.userService.getUser(user.id)
      .subscribe(
        user => this.selectedUser = user,
        error => this.errorService.handle(error)
      )
  }

  addUser() {
    this.modalService.showNotImplemented();
  }

  saveUser() {
    this.userService.saveUser(this.selectedUser)
      .catch(this.modalService.showError);
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
