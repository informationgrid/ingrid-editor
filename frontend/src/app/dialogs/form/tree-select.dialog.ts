import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';
import {DocumentService} from '../../services/document/document.service';
import {TreeQuery} from '../../store/tree/tree.query';

@Component( {
  templateUrl: './tree-select.dialog.html'
} )
export class TreeSelectDialog {
  selected: string[];

  constructor(public dialogRef: MatDialogRef<TreeSelectDialog>,
              @Inject( MAT_DIALOG_DATA ) public data: any,
              docService: DocumentService, treeQuery: TreeQuery) {
  }

  handleSelection($event: string[]) {
    this.selected = $event;
  }

  handleToggle(data: { parentId: string, expand: boolean }) {
    console.warn('Not implemented yet. Should be refactored from sidebar.component');
  }
}
