import {Component, forwardRef, Input, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {FieldBase} from '../controls';
import {Modal} from 'ngx-modal';

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
    .flex-grid .form-group {
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
      height: 30px;
      /*text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      max-width: 100px;*/
    }
    .cell.editing {
      padding: 2px 0 3px;
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

  // the number of the input box to focus on
  // will be set when modal is opened
  focusNumber: number = -1;

  addModel = {};

  markedRows: number[] = [];

  // flag to show if data is new or should be updated
  private currentRow: number = null;

  private parent: HTMLElement = null;

  private canceled = false;

  private activateNextCell = false;

  // private hoverRow: number = null;

  // The internal data model
  private _value: any[] = [{}];

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;

  constructor() {
  }

  // get accessor
  get rows(): any {
    return this._value;
  }

  showAddRowModal() {
    this.addModel = {};
    this.currentRow = null;
    this.addRowModal.open();
    setTimeout( () => this.focusNumber = 0, 0);
  }

  addRow() {
    if (this.currentRow === null && Object.keys(this.addModel).length !== 0) {
      this._value.push(Object.assign({}, this.addModel));
    }
    this.addModel = {};
    this.handleChange();
    this.addRowModal.close();
    this.focusNumber = -1;
  }

  editRow(data: any, index: number) {
    this.addModel = data;
    this.currentRow = index;
    this.addRowModal.open();
  }

  activateInput(parent: HTMLElement, row: any, column: any) {
    const label = this.parent.getElementsByClassName('cellLabel')[0];
    label.classList.add('hide');

    const input = column.editor.controlType === 'dropdown'
      ? this.createSelect(column.editor.options, row[column.editor.key])
      : this.createInput(row[column.editor.key], column.editor.type);

    this.parent.insertBefore(input, label.nextSibling);
    this.parent.classList.add('editing');
    input.focus();

    input.onblur = () => {
      if (this.canceled) {
        this.hideEditField(input);
      } else {
        this.acceptInput(<HTMLInputElement>input, row, column.editor.key);
        if (this.activateNextCell) {
          this.activateNextCell = false;
          // TODO: finish TAB behaviour in grid
          // this.activateInput(parent.nextSibling, )
        }
      }
      this.parent = null;
    };
  }

  editRowInline(row: any, column: any, event: Event) {
    // in case the editor is still open do not react on click event here
    if (this.parent) {
      return;
    }
    const target = <HTMLElement>event.target;

    if (target.classList.contains('cellLabel')) {
      this.parent = target.parentElement;
    } else {
      this.parent = target;
    }
    this.activateInput(this.parent, row, column);
  }

  acceptInput(input: HTMLInputElement, row: any, column: string ) {
    row[column] = input.value;
    this.hideEditField(input);
  }

  hideEditField(input: HTMLElement) {
    input.remove();
    const label = this.parent.getElementsByClassName('cellLabel')[0];
    label.classList.remove('hide');
    this.parent.classList.remove('editing');
    this.canceled = false;
  }

  createInput(text: string, type: string): HTMLElement {
    const input = <HTMLInputElement>document.createElement('input');
    input.tabIndex = -1;
    input.type = type;
    input.value = text === undefined ? '' : text;
    input.onkeyup = (ev) => {
      if (ev.keyCode === 13) { // ENTER
        input.blur();
      } else if (ev.keyCode === 27) { // ESCAPE
        this.canceled = true;
        input.blur();
      } else if (ev.keyCode === 9) { // TAB
        this.activateNextCell = true;
        input.blur();
      }
    };
    return input;
  }

  /**
   *
   * @param options
   * @param selected
   * @returns {HTMLSelectElement}
   */
  createSelect(options: any[], selected: string): HTMLElement {
    const select = <HTMLSelectElement>document.createElement('select');
    // select.classList.add('form-control');
    select.classList.add('selectStyle');
    options.forEach( opt => {
      const optionEl = <HTMLOptionElement>document.createElement('option');
      optionEl.value = opt.id;
      optionEl.text = opt.value;
      optionEl.selected = opt.id === selected;

      select.appendChild(optionEl);
    });
    return select;
  }

  deleteRow(index?: number) {
    // TODO: what if no index is given
    this._value.splice(index, 1);
    this.markedRows = [];
  }

  sortBy(col: any) {
    console.log( 'sort by', col );
  }

  updateSelection(row: number, event: Event) {
    const checked = (<HTMLInputElement>event.target).checked;
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
