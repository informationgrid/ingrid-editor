import {Component, EventEmitter, OnInit} from '@angular/core';
import {Group} from '../../models/user-role';

@Component({
  selector: 'ige-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  roles: Group[];
  canSaveUser = false;
  canSaveGroup = false;
  currentTab = 1;
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
