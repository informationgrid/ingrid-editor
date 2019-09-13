import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import {ColumnMode, SelectionType} from '@swimlane/ngx-datatable';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgxDatagridComponent),
  multi: true
};

@Component({
  selector: 'ige-ngx-datagrid',
  templateUrl: './ngx-datagrid.component.html',
  styleUrls: ['./ngx-datagrid.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class NgxDatagridComponent implements ControlValueAccessor, OnInit {

  @Input() columns: any[] = [];

  private _onChangeCallback: (x: any) => void;

  selected = [];

  rowIndex = 0;

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  editing = {};
  rows = [];

  constructor() {
  }

  ngOnInit() {
  }

  handleChange() {
    console.log('table changed');
    const updateValue = this.rows.map(val => Object.assign({}, val));
    // updateValue.forEach( val => delete val.__id);
    this._onChangeCallback(updateValue);
  }


  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
    if (obj instanceof Array) {
      this.rows = obj;
    } else {
      this.rows = [];
    }
  }


  updateValue(event, cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
    console.log('UPDATED!', this.rows[rowIndex][cell]);
    this.handleChange();
  }

  addRow() {
    this.rows = [...this.rows, {}];
  }
}
