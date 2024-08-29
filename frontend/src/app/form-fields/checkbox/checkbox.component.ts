/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { Component, forwardRef, Input, OnInit, Output } from "@angular/core";
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatCheckbox, MatCheckboxChange } from "@angular/material/checkbox";
import { Subject } from "rxjs";

export const CHECKBOX_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CheckboxComponent),
  multi: true,
};

@Component({
    selector: "ige-checkbox",
    templateUrl: "./checkbox.component.html",
    styleUrls: ["./checkbox.component.css"],
    providers: [CHECKBOX_CONTROL_VALUE_ACCESSOR],
    standalone: true,
    imports: [
        MatCheckbox,
        ReactiveFormsModule,
        FormsModule,
    ],
})
export class CheckboxComponent implements ControlValueAccessor, OnInit {
  @Input() label;

  @Output() change = new Subject<boolean>();

  // The internal data model
  private _value: boolean;

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
    this.value = val === "" ? false : val;
  }

  handleChange(event: MatCheckboxChange) {
    this._onChangeCallback(event.checked);
    this.change.next(event.checked);
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouchedCallback = fn;
  }
}
