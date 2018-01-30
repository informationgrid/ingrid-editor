import { Component, ElementRef, forwardRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownField } from '../../+form/controls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IColumn } from '../../+form/controls/field-opentable';

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

  // @ViewChild(Ng2SmartTableComponent) public smartTable: Ng2SmartTableComponent;

  @ViewChild( 'addRowModal' ) addModal: TemplateRef<any> = null;

  addModalRef: BsModalRef = null;

  source: any; // LocalDataSource;

  showAddButton = true;

  // the model to store data from a dialog
  addModel = {};

  settings: any = {
    columns: []
  };

  rowSelection: any[] = [];

  // The internal data model
  private _value: any[] = [{}];

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;

  constructor(private eRef: ElementRef, private modalService: BsModalService) {
  }

  ngOnInit() {
    this.settings.columns = this.mapColumns();
    this.settings.hideHeader = this.hideTableHeader;
  }

  get value() {
    return this._value;
  }

  /*@HostListener('mouseenter')
  onShowAddButton() {
    this.showAddButton = true;
  }

  @HostListener('mouseleave', ['$event', 'target'])
  onHideAddButton($event, target) {
    const e = $event.toElement || $event.relatedTarget;
    if (e.parentNode === this || e === this) {
      return;
    }
    this.showAddButton = false;
  }*/

  handleChange() {
    console.log( 'table changed' );
    this._onChangeCallback( this._value );
  }

  // Set touched on blur
  // noinspection JSUnusedGlobalSymbols
  onTouched() {
    this._onTouchedCallback();
  }

  // From ControlValueAccessor interface
  writeValue(value: any) {
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

  addRow($event) {
    // TODO: choice between inline editing and dialog
    if (this.addWithDialog) {
      this.addModalRef = this.modalService.show( this.addModal );
    } else {
      this._value.push( {} );
      this.handleChange();
    }
  }

  addRowFromDialog() {
    this._value.push( this.addModel );
    this.addModalRef.hide();
    this.handleChange();
  }

  deleteRows() {
    console.log(this.rowSelection);
    this._value = this._value.filter( item => !this.rowSelection.includes(item));
    this.handleChange();
  }

  addFromTree(event, fieldId) {
    this.addModel[fieldId] = event;
  }

  getDisplayValue(colIndex: number, key: string) {
    let value = key;
    (<DropdownField>this.columns[colIndex].editor).options.forEach(opt => {
      if (opt.id === key) {
        value = opt.value;
      }
    });
    return value;
  }

  onBlur() {
    console.log('Grid blur');
    // TODO: how to close column editor?
  }

  private mapColumns(): any[] {
    const mappedColumns = [];
    this.columns.forEach( (col: any) => {
      mappedColumns.push( {
        field: col.editor.key,
        header: col.editor.label,
        controlType: col.editor.controlType,
        options: col.editor.options
      } );
    } );
    return mappedColumns;
  }
}
