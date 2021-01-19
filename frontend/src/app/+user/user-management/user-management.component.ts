import {Component, EventEmitter, OnInit} from '@angular/core';
import {Group} from '../../models/user-role';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'ige-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  roles: Group[];
  canSaveUser: FormGroup;
  canSaveGroup = false;
  currentTab = 0;
  doUserSave = new EventEmitter<void>();
  doUserDelete = new EventEmitter<void>();
  doGroupSave = new EventEmitter<void>();
  doGroupDelete = new EventEmitter<void>();

  constructor() {
  }

  ngOnInit(): void {
  }

  canNotSave() {
    return (this.currentTab === 0 && this.canSaveUser?.invalid) || (this.currentTab === 1 && !this.canSaveGroup);
  }

  canDelete() {
    return this.canNotSave();
  }

  remove() {
    if (this.currentTab === 0) {
      this.doUserDelete.emit();
    } else {
      this.doGroupDelete.emit();
    }
  }

  save() {
    if (this.currentTab === 0) {
      this.doUserSave.emit();
    } else {
      this.doGroupSave.emit();
    }
  }
}
