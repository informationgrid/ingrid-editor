import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DefaultEditor } from 'ng2-smart-table';

@Component({
  template: `
    <combo-box #box [listData]="types"
               [forceSelection]="false"
               [displayField]="'title'"
               [valueField]="'value'"
               [localFilter]="true"
               [localFilterCaseSensitive]="false"
               (onSelect)="updateValue($event.title)"
               (onCreate)="updateValue($event)"
               (onBlur)="updateValue(box._currVal)"
               [currVal]="model.type"> </combo-box>
  `,
})
export class ComboEditorComponent extends DefaultEditor implements AfterViewInit, OnInit {

  types;
  model = {
    type: null
  };

  constructor() {
    super();
  }

  ngOnInit() {
    this.types = this.cell.getColumn().editor.config.list;
    this.model.type = this.cell.getValue();
  }

  ngAfterViewInit() {

  }

  updateValue(value) {
    this.cell.newValue = value;
  }
}
