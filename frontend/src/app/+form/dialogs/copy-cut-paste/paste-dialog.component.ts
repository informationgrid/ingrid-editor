import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {ShortTreeNode} from '../../sidebars/tree/tree.component';

export interface PasteDialogOptions {
  buttonText: string;
  titleText: string;
  contentText: string;
  disabledCondition: any;
  forAddress: boolean;
}

@Component({
  template: `
    <div class="dialog-title-wrapper">
      <h2 mat-dialog-title>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
        <span class="text">{{data.titleText}}</span>
      </h2>
    </div>
    <mat-dialog-content>
      <p>{{data.contentText}}</p>
      <ige-tree (selected)="handleSelected($event)"
                [disabledCondition]="disabledCondition"
                (currentPath)="setPath($event)"
                [forAddresses]="data.forAddress"
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
  query;
  disabledCondition = () => {
    return false;
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: PasteDialogOptions, treeQuery: TreeQuery, addressTreeQuery: AddressTreeQuery) {
    this.query = data.forAddress ? addressTreeQuery : treeQuery;
    if (data.disabledCondition) {
      this.disabledCondition = data.disabledCondition;
    }
  }

  ngOnInit() {

  }

  handleSelected(evt: any) {
    this.selection = evt;
  }

  setPath(path: ShortTreeNode[]) {
    if (path.length > 0) {
      const active = this.query.getEntity(this.selection);
      this.path = [...path.map(node => node.title), active.title];
    }
  }
}
