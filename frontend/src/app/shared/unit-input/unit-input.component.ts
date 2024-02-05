import {
  Component,
  computed,
  effect,
  forwardRef,
  input,
  OnInit,
  signal,
} from "@angular/core";
import { MatFormField, MatInput, MatSuffix } from "@angular/material/input";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatIcon } from "@angular/material/icon";
import { SelectOption } from "../../services/codelist/codelist.service";
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";

class UnitInput {
  constructor(
    public value: string,
    public unit: SelectOption,
  ) {}
}

@Component({
  selector: "ige-unit-input",
  standalone: true,
  imports: [
    MatInput,
    MatSuffix,
    MatFormField,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatIcon,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UnitInputComponent),
      multi: true,
    },
  ],
  templateUrl: "./unit-input.component.html",
  styleUrl: "./unit-input.component.scss",
})
export class UnitInputComponent implements ControlValueAccessor, OnInit {
  unitOptions = input<SelectOption[]>();

  private onChange: (x: UnitInput) => {};
  private onTouch: (x: UnitInput) => {};

  control = new FormControl();

  unit$ = signal<SelectOption>(null);
  private ctrlValue$ = toSignal(this.control.valueChanges);

  constructor() {
    effect(() => {
      if (this.onChange) {
        this.onChange({
          value: this.ctrlValue$(),
          unit: this.unit$(),
        });
      }
    });
    effect(
      () => {
        this.unit$.set(this.unitOptions()[0]);
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {}

  updateUnit(item: SelectOption) {
    this.unit$.set(item);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(obj: UnitInput): void {
    this.control.setValue(obj?.value ?? "");
    this.unit$.set(obj?.unit ?? null);
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) this.control.disable();
    else this.control.enable();
  }
}
