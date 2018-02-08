import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


export const DROPDOWN_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef( () => DropDownComponent ),
  multi: true
};

@Component( {
  selector: 'ige-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.css'],
  providers: [DROPDOWN_CONTROL_VALUE_ACCESSOR]
} )
export class DropDownComponent implements ControlValueAccessor, OnInit {
  @Input() options: any[];
  @Input() isCombo = false;
  @Input() useFilter = true;
  @Input() appendTo: string;

  isDisabled = false;

  // The internal data model
  private _value: any = {};
  selected: any;

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;

  constructor() {
  }

  ngOnInit() {
  }

  get value() {
    return this._value.value;
  }

  handleChange(value: string|any) {
    let result = value;
    if (typeof result !== 'object') {
      result = {
        id: '-1',
        value: value
      };
    }
    this._onChangeCallback( result );
  }

  writeValue(optionValue: any): void {
    if (optionValue && optionValue.id !== '-1') {
      const value = this.options.find( option => option.id === optionValue.id );
      if (value) {
        this._value = value;
      } else {
        console.error( 'Could not find option value for: ', optionValue );
      }
    } else if (optionValue) {
      this._value = optionValue.value;
    } else {
      this._value = {};
    }
    this.selected = this._value;
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }


}
