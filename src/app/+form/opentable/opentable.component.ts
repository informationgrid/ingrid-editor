import { Component, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldBase } from '../controls';
import { Modal } from 'ngx-modal';
import { LocalDataSource } from 'ng2-smart-table';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => OpenTable),
  multi: true
};


// more info here: http://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel
@Component({
  selector: 'open-table',
  templateUrl: './opentable.component.html',
  styles: [`
    ng2-smart-table {
      font-size: 1em;
    }
  `],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class OpenTable implements ControlValueAccessor, OnInit {

  @Input() columns: FieldBase<string>[];

  @Input() hideTableHeader: boolean;

  source: LocalDataSource;

  settings = {
    mode: 'click-to-edit',
    actions: {
      add: true,
      position: 'right',
      columnTitle: ''
    },
    edit: {
      editButtonContent: '<span class="glyphicon glyphicon-edit"></span>'
    },
    delete: {
      deleteButtonContent: '<span class="glyphicon glyphicon-trash"></span>'
    },
    hideSubHeader: false,
    noDataMessage: 'Diese Tabelle ist leer.',
    columns: null
  };

  // The internal data model
  private _value: any[] = [{}];

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;

  constructor() {}

  ngOnInit() {
    this.settings.columns = this.mapColumns();
    this.source = new LocalDataSource(this._value);
    this.source.add({
      type: 'aaa',
      value: 'bbb'
    });
  }

  handleChange() {
    this.source.getAll().then( data => this._onChangeCallback(data) );
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

  private mapColumns(): any {
    const mappedColumns = {};
    this.columns.forEach( (col: any) => {
      mappedColumns[col.editor.key] = {
        title: col.editor.label
      };
    });
    return mappedColumns;
  }
}
