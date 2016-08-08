import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, REACTIVE_FORM_DIRECTIVES} from '@angular/forms';
import {TableColumn} from '../controls/field-table';
import {AgGridNg2} from 'ag-grid-ng2';
import {GridOptions} from 'ag-grid';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef( () => CustomInput ),
  multi: true
};


// more info here: http://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel
@Component( {
  selector: 'data-table',
  template: `
      <div class="form-group">
        <ag-grid-ng2 #agGrid style="width: 100%; height: 120px;" class="ag-blue"

             [gridOptions]="gridOptions"
             [columnDefs]="columns"
             [rowData]="value"

             enableColResize
             suppressHorizontalScroll
             enableSorting
             singleClickEdit
             rowHeight="22">
        </ag-grid-ng2>
      </div>
  `,
  directives: [REACTIVE_FORM_DIRECTIVES, AgGridNg2],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
} )
export class CustomInput implements ControlValueAccessor {

  @Input() columns: TableColumn[];
  private rowData: any[] = [];
  private columnDefs: any[];
  gridOptions: GridOptions = {
    columnDefs: this.columnDefs,
    rowData: null,
    enableColResize: true
  };

  // The internal data model
  private _value: any = '';

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;

  ngAfterViewInit(): any {
    this.gridOptions.api.sizeColumnsToFit();
  }

  // get accessor
  get value(): any {
    return this._value;
  };

  // set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this._value) {
      this._value = v;
      this._onChangeCallback( v );
    }
  }

  // Set touched on blur
  // noinspection JSUnusedGlobalSymbols
  onTouched() {
    this._onTouchedCallback();
  }

  // From ControlValueAccessor interface
  writeValue(value: any) {
    this._value = value;
  }

  // From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this._onChangeCallback = fn;
  }

  // From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this._onTouchedCallback = fn;
  }

}