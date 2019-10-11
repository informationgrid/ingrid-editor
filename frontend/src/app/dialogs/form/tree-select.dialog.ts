import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';

@Component( {
  templateUrl: './tree-select.dialog.html'
} )
export class TreeSelectDialog {
  treeData: any;
  selected: string[];

  constructor(public dialogRef: MatDialogRef<TreeSelectDialog>,
              @Inject( MAT_DIALOG_DATA ) public data: any) {
    this.treeData = data.data;
  }

  handleSelection($event: string[]) {
    this.selected = $event;
  }

  handleToggle(data: { parentId: string, expand: boolean }) {
    console.warn('Not implemented yet. Should be refactored from sidebar.component');
  }
}
