import {Component, OnInit, AfterViewInit} from "@angular/core";
import {Split} from "../../node_modules/split.js/split";
import {Modal} from "ng2-modal";
import {ModalService} from "../services/modal/modal.service";

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


  constructor(private modalService: ModalService) {
  }

  ngOnInit() {
    this.currentTab = 'users';
    this.dialogTab = 'dataset';
    this.users = [
      {id: '1', name: 'André'},
      {id: '2', name: 'James'},
      {id: '3', name: 'Mike'}
    ];
    this.roles = [
      {id: '1', name: 'admin'},
      {id: '2', name: 'manager'},
      {id: '3', name: 'author'}
    ];
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
    this.selectedUser = user;

  }

  addUser() {
    this.modalService.showNotImplemented();
  }

  saveUser() {
    this.modalService.showNotImplemented();
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
