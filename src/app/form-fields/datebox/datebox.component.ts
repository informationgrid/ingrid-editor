import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const DATEBOX_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DateboxComponent),
  multi: true
};

@Component({
  selector: 'ige-datebox',
  templateUrl: './datebox.component.html',
  styleUrls: ['./datebox.component.css'],
  providers: [DATEBOX_CONTROL_VALUE_ACCESSOR]
})
export class DateboxComponent implements ControlValueAccessor, OnInit {

  // The internal data model
  private _value: any = {};

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

  set value(val) {
    this._value = val;
  }

  writeValue(val: any): void {
    this.value = new Date(val);
  }

  handleChange(event) {
    this._onChangeCallback( event );
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouchedCallback = fn;
  }

}
