import {Component, EventEmitter, OnInit} from '@angular/core';
import {Role} from '../../models/user-role';

@Component({
  selector: 'ige-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  roles: Role[];
  canSaveUser = false;
  canSaveGroup = false;
  currentTab = 0;
  doUserSave = new EventEmitter<void>();
  doGroupSave = new EventEmitter<void>();

  constructor() {
  }

  ngOnInit(): void {
  }

  canNotSave() {
    return (this.currentTab === 0 && !this.canSaveUser) || (this.currentTab === 1 && !this.canSaveGroup);
  }

  canDelete() {
    return this.canNotSave();
  }

  remove() {

  }

  save() {
    if (this.currentTab === 0) {
      this.doUserSave.emit();
    } else {
      this.doGroupSave.emit();
    }
  }
}
