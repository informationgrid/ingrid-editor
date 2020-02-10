import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';

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
                (currentPath)="setPath($event)"
                [showReloadButton]="false"></ige-tree>
    </mat-dialog-content>
    <mat-dialog-actions>
      <div fxFlex></div>
      <button mat-button [mat-dialog-close]="{selection: selection, path: path}" [disabled]="!selection">
        {{data.buttonText}}
      </button>
    </mat-dialog-actions>
  `
})
export class PasteDialogComponent implements OnInit {

  selection: any[] = null;
  path: string[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: PasteDialogOptions, private treeQuery: TreeQuery) {
  }

  ngOnInit() {

  }

  handleSelected(evt: any) {
    this.selection = evt;
  }

  setPath(path: string[]) {
    const active = this.treeQuery.getEntity(this.selection);
    this.path = [...path, active.title];
  }
}
