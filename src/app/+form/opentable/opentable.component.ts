import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldBase } from '../controls';
import { LocalDataSource } from 'ng2-smart-table';
import { Observable } from 'rxjs/Observable';
import { DropdownField } from '../controls/field-dropdown';
import { SelectRenderComponent } from './renderComponents/select.render.component';
import { ComboEditorComponent } from './editorComponents/combo.editor.component';
import { Ng2SmartTableComponent } from 'ng2-smart-table/ng2-smart-table.component';
import { Row } from 'ng2-smart-table/lib/data-set/row';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => OpenTable),
  multi: true
};


// more info here: http://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel
@Component({
  selector: 'open-table',
  templateUrl: './opentable.component.html',
  styleUrls: ['./opentable.component.css'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class OpenTable implements ControlValueAccessor, OnInit {

  @Input() columns: FieldBase<string>[];

  @Input() hideTableHeader: boolean;

  @ViewChild(Ng2SmartTableComponent) public smartTable: Ng2SmartTableComponent;

  source: LocalDataSource;

  showAddButton = true;

  settings: any = {
    // mode: 'click-to-edit',
    closeEditorOnClick: false, // TODO: implement in table!
    actions: {
      add: false,
      position: 'right',
      columnTitle: ''
    },
    add: {
      createButtonContent: '<span class="fa fa-check"></span>',
      cancelButtonContent: '<span class="fa fa-remove"></span>'
    },
    edit: {
      editButtonContent: '<span class="fa fa-edit"></span>',
      saveButtonContent: '<span class="fa fa-check"></span>',
      cancelButtonContent: '<span class="fa fa-remove"></span>'
    },
    delete: {
      deleteButtonContent: '<span class="fa fa-trash"></span>'
    },
    hideSubHeader: true,
    noDataMessage: 'Diese Tabelle ist leer.',
    columns: null,
    pager: {
      perPage: 4
    }
  };

  // The internal data model
  private _value: any[] = [{}];

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;

  constructor(private eRef: ElementRef) {
  }

  ngOnInit() {
    this.settings.columns = this.mapColumns();
    this.settings.hideHeader = this.hideTableHeader;

    // override original function to enable click-to-edit functionality
    this.smartTable.onUserSelectRow = function(selectedRow: Row) {
      if (this.grid.getSetting('mode') === 'click-to-edit') {
        this.grid.getRows().forEach(row => row.isInEditing ? this.grid.save(row, this.createConfirm) : null);
        // set editing mode a bit later so that document click handler is called correctly
        // TODO: focus clicked cell editor
        setTimeout(() => selectedRow.isInEditing = true);

      } else if (this.grid.getSetting('selectMode') !== 'multi') {
        this.grid.selectRow(selectedRow);
        this.emitUserSelectRow(selectedRow);
        this.emitSelectRow(selectedRow);

      }
    }
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
    console.log('table changed');
    this.source.getAll().then(data => this._onChangeCallback(data));
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
    this.source = new LocalDataSource(this._value);

    // register on data store
    Observable.merge(
      this.source.onAdded(),
      this.source.onRemoved(),
      this.source.onUpdated()
    ).subscribe(() => this.handleChange());
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
    this.smartTable.grid.createFormShown = true;
  }

  private mapColumns(): any {
    const mappedColumns = {};
    this.columns.forEach((col: any) => {
      const editor = this.mapEditor(col.editor);
      const renderComponent = null; // this.getRenderComponent(col.editor);

      mappedColumns[col.editor.key] = {
        title: col.editor.label,
        width: col.width ? col.width : null,
        editor: editor,
        renderComponent: renderComponent,
        onComponentInitFunction: col.editor.useCodelist !== null
          ? (instance) => instance.options = col.editor.options
          : null,
        type: renderComponent ? 'custom' : 'text'
      };
    });
    return mappedColumns;
  }

  private mapEditor(col: FieldBase<any>) {
    const editor: any = {};

    switch (col.controlType) {
      case 'dropdown':
        const dropdown = (<DropdownField>col);
        if (dropdown.isCombo) {
          editor.type = 'custom';
          editor.component = ComboEditorComponent
        } else {
          editor.type = 'list';
        }
        editor.config = {
          list: dropdown.options.map(option => {
            return {
              title: option.value,
              value: option.id
            }
          })
        };
        break;
      default:
        editor.type = 'text';
    }

    return editor;
  }

  private getRenderComponent(editor: any) {
    if (editor.useCodelist) {
      return SelectRenderComponent;
    } else {
      return null;
    }
  }
}
