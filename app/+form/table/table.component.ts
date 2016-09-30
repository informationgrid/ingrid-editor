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
        <ag-grid-ng2 #agGrid style="width: 100%;" [style.height]="gridHeight + 'px'" class="ag-fresh"

             [gridOptions]="gridOptions"
             [columnDefs]="columns"
             [rowData]="value"

             enableColResize
             suppressHorizontalScroll
             rowSelection="multiple"
             enableSorting
             rowHeight="22">
        </ag-grid-ng2>
      </div>
  `,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class CustomInput implements ControlValueAccessor {

  @Input() columns: TableColumn[];
  // @Input() dataValue: any[];
  private columnDefs: any[];
  gridOptions: GridOptions = {
    columnDefs: this.columnDefs,
    rowData: null,
    enableColResize: true
  };

  gridHeight: number = 22*4 + 3 + 5;

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
    // console.log( '.', this._value );
    return this._value;
  };

  handleChange(grid: AgGridNg2) {
    // console.log( 'changed ', arguments );
    let nonEmptyRowData: any[] = [];
    let hasEmptyRow: boolean = false;
    grid.api.forEachNode( function(node) {
      if (values(node.data).length === 0) {
        hasEmptyRow = true;
      } else {
        nonEmptyRowData.push(node.data);
      }
    });
    // console.log('Row Data:');
    // console.log(nonEmptyRowData);
    this._onChangeCallback(nonEmptyRowData.slice());

    nonEmptyRowData.push({});
    this._value = nonEmptyRowData;
    // if no empty row is present then add one
    // if (!hasEmptyRow) {
    //   this.gridOptions.api.addItems([{}]);
    //   this._value.push({});
    // }
  }

  // Set touched on blur
  // noinspection JSUnusedGlobalSymbols
  onTouched() {
    this._onTouchedCallback();
  }

  // From ControlValueAccessor interface
  writeValue(value: any) {
    debugger;
    // console.log( '* -> ', value );
    if (value instanceof Array) {
      // value.push({});
      this._value = value;
    } else {
      this._value = [{}];
    }
    // this._value = value;
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