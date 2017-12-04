import { Component, ElementRef, forwardRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldBase } from '../../+form/controls/index';
import { LocalDataSource } from 'ng2-smart-table';
import { Observable } from 'rxjs/Observable';
import { DropdownField } from '../../+form/controls/field-dropdown';
import { SelectRenderComponent } from './renderComponents/select.render.component';
import { ComboEditorComponent } from './editorComponents/combo.editor.component';
import { Ng2SmartTableComponent } from 'ng2-smart-table/ng2-smart-table.component';
import { Row } from 'ng2-smart-table/lib/data-set/row';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { TitleRenderComponent } from './renderComponents/title.render.component';
import { merge } from 'rxjs/observable/merge';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DataGridComponent),
  multi: true
};


// more info here: http://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel
@Component({
  selector: 'ige-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class DataGridComponent implements ControlValueAccessor, OnInit {

  @Input() columns: FieldBase<string>[];

  @Input() hideTableHeader: boolean;

  @Input() addWithDialog = false;

  @ViewChild(Ng2SmartTableComponent) public smartTable: Ng2SmartTableComponent;

  @ViewChild('addRowModal') addModal: TemplateRef<any> = null;

  addModalRef: BsModalRef = null;

  source: LocalDataSource;

  showAddButton = true;

  // the model to store data from a dialog
  addModel = {};

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

  constructor(private eRef: ElementRef, private modalService: BsModalService) {
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
    merge(
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
    if (this.addWithDialog) {
      this.addModalRef = this.modalService.show(this.addModal);
    } else {
      this.smartTable.grid.createFormShown = true;
    }
  }

  addRowFromDialog() {
    this._value.push( this.addModel );
    this.source = new LocalDataSource(this._value);
    this.addModalRef.hide();
    this.handleChange();
  }

  addFromTree(event, fieldId) {
    this.addModel[fieldId] = event;
  }

  private mapColumns(): any {
    const mappedColumns = {};
    this.columns.forEach((col: any) => {
      const editor = this.mapEditor(col.editor);
      // const renderComponent = null;
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

  private getRenderComponent(editor: FieldBase<string>) {
    if (editor.controlType === 'tree') {
      return TitleRenderComponent;
    } else if (editor.controlType === 'dropdown') {
      if ((<DropdownField>editor).useCodelist) {
        return SelectRenderComponent;
      }
    } else {
      return null;
    }
  }
}
