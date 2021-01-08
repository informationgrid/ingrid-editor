import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Permissions, TreePermission} from '../../user';
import {PermissionsDialogComponent} from '../../permissions/permissions-dialog.component';

@Component({
  selector: 'ige-permissions-show',
  templateUrl: './permissions-show.component.html',
  styleUrls: ['./permissions-show.component.scss']
})
export class PermissionsShowComponent implements OnInit {

  permissions: {
    pages: { value: string }[],
    actions: { value: string }[],
    documents: TreePermission[],
    addresses: TreePermission[]
  };

  _data: Permissions;
  hasNoPermissions = true;

  @Output() update = new EventEmitter<Permissions>();

  @Input() set data(perms: Permissions) {
    this._data = perms;
    this.permissions = {
      pages: this.convertObjectToArray(perms.pages),
      actions: this.convertObjectToArray(perms.actions),
      documents: perms.documents,
      addresses: perms.addresses
    };

    this.hasNoPermissions = this.permissions.pages.length === 0
      && this.permissions.actions.length === 0
      && this.permissions.documents.length === 0
      && this.permissions.addresses.length === 0;
  }

  constructor(private dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  private convertObjectToArray(myObject): { value: string }[] {
    return Object.keys(myObject)
      .filter(page => myObject[page])
      .map(page => ({value: page}));
  }

  choosePermissions() {
    this.dialog.open(PermissionsDialogComponent, {
      minWidth: '80%',
      data: this._data
    }).afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        this.update.emit(result);
      }
    });
  }

}
