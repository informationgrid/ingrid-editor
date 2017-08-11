import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldBase } from '../controls';
import { Modal } from 'ngx-modal';
import { LocalDataSource } from 'ng2-smart-table';
import { Observable } from 'rxjs/Observable';
import { DropdownField } from '../controls/field-dropdown';
import { SelectRenderComponent } from './renderComponents/select.render.component';
import { ComboEditorComponent } from './editorComponents/combo.editor.component';

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

    /deep/ td.ng2-smart-actions, /deep/ th.ng2-smart-actions {
      width: 55px;
    }

    /deep/ table th, /deep/ table td {
      padding: 0.5rem 1rem;
      border: 1px solid #e9ebec;
    }

    .addButton {
      position: absolute;
      right: 0;
      top: -20px;
      /*padding-bottom: 10px;*/
    }

    :host {
      position: relative;
      display: block;
    }
  `],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class OpenTable implements ControlValueAccessor, OnInit {

  @Input() columns: FieldBase<string>[];

  @Input() hideTableHeader: boolean;

  source: LocalDataSource;

  addNew = new EventEmitter<any>();

  showAddButton = false;

  settings: any = {
    mode: 'click-to-edit',
    actions: {
      add: false,
      position: 'right',
      columnTitle: ''
    },
    add: {
      createButtonContent: '<span class="glyphicon glyphicon-ok"></span>',
      cancelButtonContent: '<span class="glyphicon glyphicon-remove"></span>'
    },
    edit: {
      editButtonContent: '<span class="glyphicon glyphicon-edit"></span>',
      saveButtonContent: '<span class="glyphicon glyphicon-ok"></span>',
      cancelButtonContent: '<span class="glyphicon glyphicon-remove"></span>'
    },
    delete: {
      deleteButtonContent: '<span class="glyphicon glyphicon-trash"></span>'
    },
    hideSubHeader: true,
    noDataMessage: 'Diese Tabelle ist leer.',
    columns: null
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
    // this.source = new LocalDataSource(this._value);
    /*this.source.add({
      type: 'aaa',
      value: 'bbb'
    });*/
  }

  @HostListener('mouseenter')
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
  }

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

  private mapColumns(): any {
    const mappedColumns = {};
    this.columns.forEach((col: any) => {
      const editor = this.mapEditor(col.editor);
      const renderComponent = this.getRenderComponent(col.editor);

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
