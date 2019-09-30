import {Component, forwardRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import {ColumnMode, DatatableComponent, DataTableHeaderComponent, SelectionType} from '@swimlane/ngx-datatable';

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

interface SelectOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'ige-ngx-datagrid',
  templateUrl: './ngx-datagrid.component.html',
  styleUrls: ['./ngx-datagrid.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class NgxDatagridComponent implements ControlValueAccessor, OnInit, OnDestroy {

  @ViewChild('table', {static: true}) table: DatatableComponent;

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

  ngOnDestroy(): void {
    // in storybook after a hot refresh an error occurs, because of detection on a destroyed view
    DataTableHeaderComponent.prototype.setStylesByGroup = function() {
      this._styleByGroup.left = this.calcStylesByGroup('left');
      this._styleByGroup.center = this.calcStylesByGroup('center');
      this._styleByGroup.right = this.calcStylesByGroup('right');
      if (!this.cd['destroyed']) {
        this.cd.detectChanges();
      }
    }
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

    // TODO: jump to new row and open editor of first column

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

  mapSelectValue(value, options: SelectOption[]) {
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
