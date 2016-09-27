import {Component, forwardRef, Input} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {TableColumn} from "../controls/field-table";
import {GridOptions} from "ag-grid";
import {AgGridNg2} from "ag-grid-ng2";
import values = require("core-js/fn/object/values");

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CustomInput),
  multi: true
};


// more info here: http://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel
@Component({
  selector: 'data-table',
  template: `
      <div class="form-group">
        <ag-grid-ng2 #agGrid style="width: 100%; height: 160px;" class="ag-fresh"

             [gridOptions]="gridOptions"
             [columnDefs]="columns"
             [rowData]="value"

             enableColResize
             suppressHorizontalScroll
             rowSelection="multiple"
             enableSorting>
        </ag-grid-ng2>
      </div>
  `,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
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
  private _value: any[] = [{}];

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;

  ngAfterViewInit(): any {
    this.gridOptions.api.sizeColumnsToFit();
    this.gridOptions.api.addItems([{}]);

    this.gridOptions.api.addEventListener('cellValueChanged', (grid: any) => this.handleChange(grid));
    this.gridOptions.api.hideOverlay();
    // this._value = [{}];
  }

  // get accessor
  get value(): any {
    console.log( '.', this._value );
    if (!this._value) return [];
    let result = [];
    for (let i=0; i<this._value.length; i++) {
      if (i !== this._value.length-1) result.push(this._value[i]);
    }
    return result; // === undefined ? [{}] : this._value;
  };

  // set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this._value) {
      this._value = v;
      // add an empty row for additional data
      // this._value.push({});
      this._onChangeCallback(v);
    }
  }

  handleChange(grid: AgGridNg2) {
    console.log( 'changed ', arguments );
    let rowData: any[] = [];
    let hasEmptyRow: boolean = false;
    grid.api.forEachNode( function(node) {
      if (values(node.data).length === 0) hasEmptyRow = true;
      rowData.push(node.data);
    });
    console.log('Row Data:');
    console.log(rowData);
    debugger;
    this._value = rowData;
    this._onChangeCallback(rowData);

    // if no empty row is present then add one
    if (!hasEmptyRow) {
      this.gridOptions.api.addItems([{}]);
      this._value.push({});
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