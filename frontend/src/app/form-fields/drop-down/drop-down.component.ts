import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CodelistEntry } from "../../store/codelist/codelist.model";

export const DROPDOWN_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DropDownComponent),
  multi: true,
};

@Component({
  selector: "ige-drop-down",
  templateUrl: "./drop-down.component.html",
  styleUrls: ["./drop-down.component.css"],
  providers: [DROPDOWN_CONTROL_VALUE_ACCESSOR],
})
export class DropDownComponent implements ControlValueAccessor, OnInit {
  @Input() options: CodelistEntry[];
  @Input() isCombo = false;
  @Input() useFilter = true;
  @Input() appendTo: string;
  @Input() lang = "de";

  isDisabled = false;

  // The internal data model
  private _value: string;
  selected: string;

  simpleOptions: CodelistEntry[] = [];

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;
  filteredOptions: any[];

  constructor() {}

  ngOnInit() {
    this.simpleOptions = this.options; // this.options.map(option => option.value);
    this.filteredOptions = this.simpleOptions;
  }

  get value() {
    return this._value;
  }

  handleChange(value: string | any) {
    let result = value;
    if (typeof result !== "object") {
      result = {
        id: "-1",
        value: value,
      };
    }
    this._onChangeCallback(result);
  }

  writeValue(optionValue: any): void {
    if (optionValue && optionValue.id !== "-1") {
      const value = this.options.find((option) => option.id === optionValue.id);
      if (value) {
        this._value = value.fields[this.lang];
      } else {
        console.error("Could not find option value for: ", optionValue);
      }
    } else if (optionValue) {
      this._value = optionValue.value;
    } else {
      this._value = null;
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

  onInput(value: string): void {
    this.filteredOptions = this.simpleOptions.filter(
      (option) =>
        option.fields[this.lang].toLowerCase().indexOf(value.toLowerCase()) ===
        0,
    );
  }
}
