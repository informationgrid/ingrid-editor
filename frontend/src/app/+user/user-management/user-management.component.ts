import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
} from "@angular/core";
import { Group } from "../../models/user-group";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "ige-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent implements OnInit {
  roles: Group[];
  canSaveUser: boolean;
  canSaveGroup: FormGroup;
  canDeleteUser = false;
  canDeleteGroup = false;
  currentTab = 0;
  doUserSave = new EventEmitter<void>();
  doUserDelete = new EventEmitter<void>();
  doGroupSave = new EventEmitter<void>();
  doGroupDelete = new EventEmitter<void>();
  canSave = false;

  constructor() {}

  ngOnInit(): void {}

  canNotSave() {
    return (
      (this.currentTab === 0 && !this.canSaveUser) ||
      (this.currentTab === 1 && this.canSaveGroup?.invalid)
    );
  }

  canDelete() {
    return (
      (this.currentTab === 0 && this.canDeleteUser) ||
      (this.currentTab === 1 && !this.canDeleteGroup)
    );
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
