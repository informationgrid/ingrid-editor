import { Component, Inject, OnInit } from '@angular/core';
import { CopyMoveEnum } from './enums';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: `
    <h2 mat-dialog-title>Einfügen</h2>
    <mat-dialog-content>
      <p>Wohin wollen Sie die ausgewählten Datensätze kopieren?</p>
      <ige-tree (selected)="handleSelected($event)"></ige-tree>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="selection" class="pull-right" [disabled]="!selection">{{copyOrMoveText}}</button>
    </mat-dialog-actions>
  `
})
export class PasteDialogComponent implements OnInit {

  selection: any[] = null;

  copyOrMoveText: string;

  constructor(@Inject( MAT_DIALOG_DATA ) public data: any) {
    // TODO: also show button for document or tree copy/cut
  }

  ngOnInit() {
    this.copyOrMoveText = this.data.mode === CopyMoveEnum.COPY ? 'Kopieren' : 'Verschieben';
  }

  handleSelected(evt: any) {
    this.selection = evt;
  }

}
