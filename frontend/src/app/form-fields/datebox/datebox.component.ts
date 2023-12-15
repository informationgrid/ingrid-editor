/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, forwardRef, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export const DATEBOX_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DateboxComponent),
  multi: true,
};

@Component({
  selector: "ige-datebox",
  templateUrl: "./datebox.component.html",
  styleUrls: ["./datebox.component.css"],
  providers: [DATEBOX_CONTROL_VALUE_ACCESSOR],
})
export class DateboxComponent implements ControlValueAccessor, OnInit {
  // The internal data model
  private _value: Date;

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
    this.value = val === "" ? null : new Date(val);
  }

  handleChange(event) {
    this._onChangeCallback(event);
  }

  handleBlur() {
    this._onChangeCallback(this.value);
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouchedCallback = fn;
  }
}
