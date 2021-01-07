import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Permissions} from '../user';

@Component({
  templateUrl: './permissions-dialog.component.html'
})
export class PermissionsDialogComponent {
  newPermissions: Permissions;

  constructor(@Inject(MAT_DIALOG_DATA) public permissions: Permissions) {
  }
}
