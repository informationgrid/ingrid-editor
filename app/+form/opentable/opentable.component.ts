import {Component, forwardRef, Input, ViewChild} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {FieldBase} from "../controls";
import {Modal} from "ng2-modal";

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => OpenTable),
  multi: true
};


// more info here: http://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel
@Component({
  selector: 'open-table',
  template: require('./opentable.component.html'),
  styles: [`
    .form-group {
      display: flex;
    }
    .form-group > div {
      /*padding: 10px;*/
      /*line-height: 20px;*/
    }
    i {
      vertical-align: text-bottom;
    }
    .cell {
      padding: 5px;
      line-height: 20px;
    }
    .control-label {
      font-weight: lighter;
      font-style: italic;
      padding: 0 5px;
    }
    .cell input[type=checkbox] {
      margin: 0;
      vertical-align: middle;
    }
    .clickable {
      cursor: pointer;
    }
    .odd {
      background-color: #f6f6f6;
    }
    .firstRow {
      border-top: 1px solid #d8d8d8;
    }
    .last {
      flex: 1;
    }
  `],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class OpenTable implements ControlValueAccessor {

  @Input() columns: FieldBase<string>[];

  @ViewChild('addRowModal') addRowModal: Modal;

  addModel = {};

  markedRows: number[] = [];

  // flag to show if data is new or should be updated
  private currentRow: number = null;

  // private hoverRow: number = null;

  // The internal data model
  private _value: any[] = [{}];

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;

  constructor() {
  }

  ngAfterViewInit(): any {
  }

  // get accessor
  get value(): any {
    return this._value;
  }

  showAddRowModal() {
    this.addModel = {};
    this.currentRow = null;
    this.addRowModal.open();
  }

  addRow() {
    if (this.currentRow === null) {
      this._value.push(Object.assign({}, this.addModel));
    }
    this.addModel = {};
    this.handleChange();
    this.addRowModal.close();
  }

  editRow(data: any, index: number) {
    this.addModel = data;
    this.currentRow = index;
    this.addRowModal.open();
  }

  deleteRow(index: number) {
    this._value.splice(index, 1);
    this.markedRows = [];
  }

  sortBy(col: any) {
    console.log( 'sort by', col );
  }

  updateSelection(row: number, event: Event) {
    let checked = (<HTMLInputElement>event.target).checked;
    if (checked) {
      this.markedRows.push(row);
    } else {
      this.markedRows.splice(this.markedRows.indexOf(row), 1);
    }
  }

  handleChange() {
    this._onChangeCallback(this._value);
  }

  // Set touched on blur
  // noinspection JSUnusedGlobalSymbols
  onTouched() {
    this._onTouchedCallback();
  }

  // From ControlValueAccessor interface
  writeValue(value: any) {
    // if (value instanceof Array) {
    //   this._value = value;
    // } else {
    //   this._value = [{}];
    // }
    if (value instanceof Array) {
      this._value = value;
    } else {
      this._value = [];
    }
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