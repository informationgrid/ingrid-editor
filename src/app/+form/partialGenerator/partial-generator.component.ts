import {
  Component, forwardRef, Input, ViewChild, Output, EventEmitter, TemplateRef,
  AfterViewInit
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {FormControlService} from '../../services/form-control.service';
import {PartialGeneratorField} from '../controls/field-partial-generator';
import { MatDialog } from '@angular/material';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PartialGenerator),
  multi: true
};


// more info here: http://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel
@Component({
  selector: 'partial-generator',
  templateUrl: './partial-generator.component.html',
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class PartialGenerator implements ControlValueAccessor, AfterViewInit {

  @Input() form: any;
  @Input() field: PartialGeneratorField;

  @Output() onAddSection = new EventEmitter<any>();

  @ViewChild('addPartial') addPartialModal: TemplateRef<any>;

  types: any[] = [];
  choiceType: string;

  private _value: any[] = [{}];

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;

  constructor(private dialog: MatDialog, private qcs: FormControlService) {
  }

  ngAfterViewInit(): any {
    this.field.partials.forEach( part => {
      this.types.push({ label: part.label, id: part.key });
    });
    this.choiceType = this.types[0].id;
  }

  // get accessor
  get value(): any {
    return this._value;
  }

  /**
   * Show a dialog for a selection of partial fields. If there's only one
   * choice, then skip the dialog.
   */
  showPartialChoice() {
    if (this.types.length > 1) {
      // TODO: this.addPartialModalRef = this.modalService.show(this.addPartialModal);
    } else {
      this.onAddSection.emit({key: this.field.key, section: this.types[0].id});
    }
  }

  addPartialToForm() {
    this.onAddSection.emit({key: this.field.key, section: this.choiceType});
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
