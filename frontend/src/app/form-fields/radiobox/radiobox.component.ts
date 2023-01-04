import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatLegacyRadioChange as MatRadioChange } from "@angular/material/legacy-radio";

export const RADIOBOX_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RadioboxComponent),
  multi: true,
};

@Component({
  selector: "ige-radiobox",
  templateUrl: "./radiobox.component.html",
  styleUrls: ["./radiobox.component.css"],
  providers: [RADIOBOX_CONTROL_VALUE_ACCESSOR],
})
export class RadioboxComponent implements ControlValueAccessor, OnInit {
  @Input() options: any[];
  @Input() radioName: string;

  // The internal data model
  private _value: string;

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;

  constructor() {}

  ngOnInit() {}

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
  }

  writeValue(val: any): void {
    this.value = val === "" ? undefined : val;
  }

  handleChange(event: MatRadioChange) {
    this._onChangeCallback(event.value);
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouchedCallback = fn;
  }
}
