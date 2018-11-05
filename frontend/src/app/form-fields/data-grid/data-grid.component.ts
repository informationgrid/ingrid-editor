import {Component, ElementRef, forwardRef, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {IColumn} from '../../+form/controls/field-opentable';
import {MatDialog} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef( () => DataGridComponent ),
  multi: true
};

// more info here: http://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel
@Component( {
  selector: 'ige-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
} )
export class DataGridComponent implements ControlValueAccessor, OnInit {

  @Input() columns: IColumn[];

  @Input() hideTableHeader: boolean;

  @Input() addWithDialog = false;

  @Input() height: number;

  @Input() label: string;

  // @ViewChild(Ng2SmartTableComponent) public smartTable: Ng2SmartTableComponent;

  @ViewChild( 'addRowModal' ) addModal: TemplateRef<any> = null;

  editCache = {};

  // The internal data model
  private _value = [];

  private internalIndex = 1;

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;

  private selection: SelectionModel<any>;

  constructor(private eRef: ElementRef, private dialog: MatDialog) {
  }

  addRow(): void {
    this._value = [ ...this._value, { __id: this.internalIndex++} ];
    this.updateEditCache();
    this.handleChange();
  }

  deleteRow(i: string): void {
    this._value = this._value.filter(d => d.__id !== i);
    this.handleChange();
  }

  startEdit(id: string): void {
    this.editCache[ id ].edit = true;
  }

  cancelEdit(key: string): void {
    this.editCache[ key ].edit = false;
  }

  saveEdit(id: string): void {
    const index = this._value.findIndex(item => item.__id === id);
    this.editCache[ id ].data.__id = this.internalIndex++;
    Object.assign(this._value[ index ], this.editCache[ id ].data);
    // this.dataSet[ index ] = this.editCache[ __id ].data;
    this.editCache[ id ].edit = false;
    this.handleChange();
  }

  updateEditCache(): void {
    this._value.forEach(item => {
      if (!this.editCache[ item.__id ]) {
        this.editCache[ item.__id ] = {
          edit: false,
          data: { ...item }
        };
      }
    });
  }

  ngOnInit(): void {
    this.updateEditCache();
  }


  get value() {
    return this._value;
  }

  handleChange() {
    console.log( 'table changed' );
    let updateValue = this._value.map( val => Object.assign({}, val));
    updateValue.forEach( val => delete val.__id);
    this._onChangeCallback( updateValue );
  }

  // Set touched on blur
  // noinspection JSUnusedGlobalSymbols
  onTouched() {
    this._onTouchedCallback();
  }

  // From ControlValueAccessor interface
  writeValue(value: any) {

    if (value instanceof Array) {
      this._value = this.addSimpleId(value);
      this.updateEditCache();
    } else {
      this._value = [];
    }
  }

  addSimpleId(value: Array<any>) {
    value.forEach( val => val.__id = this.internalIndex++);
    return value;
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
