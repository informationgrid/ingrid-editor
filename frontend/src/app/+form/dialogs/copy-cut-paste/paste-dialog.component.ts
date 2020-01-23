import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface PasteDialogOptions {
  buttonText: string;
  titleText: string;
  contentText: string;
  disabledCondition: any;
}

@Component({
  template: `
    <h2 mat-dialog-title>{{data.titleText}}</h2>
    <mat-dialog-content>
      <p>{{data.contentText}}</p>
      <ige-tree (selected)="handleSelected($event)" [disabledCondition]="data.disabledCondition"
                [showReloadButton]="false"></ige-tree>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="selection" class="pull-right" [disabled]="!selection">{{data.buttonText}}</button>
    </mat-dialog-actions>
  `
})
export class PasteDialogComponent implements OnInit {

  selection: any[] = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PasteDialogOptions) {
  }

  ngOnInit() {

  }

  handleSelected(evt: any) {
    this.selection = evt;
  }

}
