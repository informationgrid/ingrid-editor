import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import {ColumnMode, DatatableComponent, INgxDatatableConfig, SelectionType} from '@swimlane/ngx-datatable';

export interface ColumnOptions {
  label: string;
  value: string | number;
}

export interface Column {
  key: string;
  label: string;
  type?: string;
  options?: ColumnOptions[];
}

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

  @Input() columns: Column[] = [];

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
      this.rows = [...obj];
    } else {
      this.rows = [];
    }
  }


  updateValue(value, row, cell) {
    console.log('inline editing rowIndex', row);
    this.editing[row + '-' + cell] = false;
    this.rows[row] = {...this.rows[row], [cell]: value};
    this.rows = [...this.rows];
    console.log('UPDATED!', this.rows[row][cell]);
    this.handleChange();
  }

  addRow(table: DatatableComponent) {
    this.rows = [...this.rows, {}];
    // table.recalculate();
  }

  focusNextCell(row: number, cell: string, colIndex: number) {
    console.log('tab key', colIndex);
    this.editing[row + '-' + cell] = false;

    if (colIndex === this.columns.length - 1) {
      this.editing[(row + 1) + '-' + this.columns[0].key] = true;
    } else {
      this.editing[row + '-' + this.columns[colIndex + 1].key] = true;
    }

  }

  mapSelectValue(value, options: ColumnOptions[]) {
    const optionItem = options.find(option => option.value === value);

    return optionItem ? optionItem.label : value;
  }

  /**
   * Remove selected rows from table data.
   */
  removeRow() {
    this.rows = this.rows.filter(row => this.selected.indexOf(row) === -1);
    this.selected = [];
  }
}
