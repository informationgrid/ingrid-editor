/*
 * ==================================================
 * Copyright (C) 2025-2026 wemove digital solutions GmbH
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
import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { FieldType } from "@ngx-formly/material/form-field";
import { FieldTypeConfig, FormlyFieldProps } from "@ngx-formly/core";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from "@angular/material/datepicker";
import { MatError, MatInput } from "@angular/material/input";
import { MatFormField, MatSuffix } from "@angular/material/form-field";
import { MatDivider } from "@angular/material/divider";
import {
  MatTimepicker,
  MatTimepickerInput,
  MatTimepickerToggle,
} from "@angular/material/timepicker";
import { map, startWith } from "rxjs/operators";
import { FormLabelComponent } from "../../wrapper/form-label/form-label.component";
import { ErrorStateMatcher, MatOption } from "@angular/material/core";
import { TimeReferenceExplanationComponent } from "./time-reference-explanation/time-reference-explanation.component";
import { MatSelect } from "@angular/material/select";
import { timezones } from "./timezones";
import { MatSelectSearchComponent } from "ngx-mat-select-search";
import { SelectOption } from "../../../services/codelist/codelist.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormErrorComponent } from "../../../+form/form-shared/ige-form-error/form-error.component";

class MyErrorStateMatcher implements ErrorStateMatcher {
  constructor(private component: TimeReferenceComponent) {}

  isErrorState(control: FormControl | null): boolean {
    if (this.component.showError && control?.invalid) return control.invalid;
    else return false;
  }
}

interface TimeReferenceProps extends FormlyFieldProps {
  showTimepicker: boolean;
  showTimezone: boolean;
  defaultTimezone?: string;
}

@Component({
  selector: "ige-time-reference-input",
  imports: [
    ReactiveFormsModule,
    MatRadioGroup,
    MatRadioButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatInput,
    MatSuffix,
    MatDivider,
    MatTimepicker,
    MatTimepickerToggle,
    MatTimepickerInput,
    FormLabelComponent,
    MatError,
    TimeReferenceExplanationComponent,
    MatSelect,
    MatOption,
    MatSelectSearchComponent,
    FormErrorComponent,
  ],
  templateUrl: "./time-reference.component.html",
  styleUrl: "./time-reference.component.scss",
})
export class TimeReferenceComponent
  extends FieldType<FieldTypeConfig<TimeReferenceProps>>
  implements OnInit
{
  private destroyRef = inject(DestroyRef);

  protected readonly showTimepicker = signal<boolean>(false);
  protected readonly showTimezone = signal<boolean>(false);

  temporalForm = new FormGroup({
    type: new FormControl<string | null>(null, Validators.required),
    atDate: new FormControl<Date | null>(null, {
      validators: Validators.required,
      updateOn: "blur",
    }),
    intervalFrom: new FormControl<string | null>(null),
    fromDate: new FormControl<Date | null>(null, {
      validators: Validators.required,
      updateOn: "blur",
    }),
    intervalTo: new FormControl<string | null>(null),
    tillDate: new FormControl<Date | null>(null, {
      validators: Validators.required,
      updateOn: "blur",
    }),
    timezone: new FormControl<string | null>(null),
  });
  public filterCtrl = new FormControl();
  filteredOptions = signal<Partial<SelectOption>[]>(timezones);
  matcher = new MyErrorStateMatcher(this);

  ngOnInit(): void {
    if (this.props.showTimepicker) this.showTimepicker.set(true);
    if (this.props.showTimezone) this.showTimezone.set(true);

    // initialize from current value of Formly control
    const defaults = {
      type: null,
      intervalFrom: "not-available",
      atDate: null as Date | null,
      fromDate: null as Date | null,
      intervalTo: "not-available",
      tillDate: null as Date | null,
      timezone: this.props.defaultTimezone ?? (undefined as string),
    };

    // reflect external Formly control changes into inner form
    this.formControl?.valueChanges
      .pipe(startWith(this.formControl.value))
      .subscribe((value) => {
        const next = { ...defaults, ...this.mapForForm(value) };
        this.temporalForm.patchValue(next, { emitEvent: false });
        this.handleDisabledStates(next);
        this.handleTimezoneState(next);
      });

    // reflect internal form changes into Formly control
    this.temporalForm.valueChanges
      .pipe(map((value) => this.mapForBackend(value)))
      .subscribe((value) => {
        this.formControl?.patchValue(value);
        this.formControl?.markAsDirty();
        this.formControl?.markAsTouched();
      });

    this.formControl.addValidators((_) => {
      return this.temporalForm.valid ? null : { someError: true };
    });

    this.filterCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.filteredOptions.set(this.search(value)));

    this.formControl.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.formControl.disabled) {
          this.temporalForm.disable({ emitEvent: false });
        } else {
          this.temporalForm.enable({ emitEvent: false });
          this.handleDisabledStates(this.temporalForm.value);
        }
      });
  }

  private mapForForm(value: any) {
    if (!value) return {};
    const isRange = value.resourceRange !== undefined;
    const result: any = {
      type: value.type,
    };
    if (value.type === "at") {
      result.atDate = value.resourceDate;
      return result;
    }

    result.intervalFrom = value.intervalFrom ?? "not-available";
    result.intervalTo = value.intervalTo ?? "not-available";

    if (this.showTimezone()) {
      result.timezone = value.timezone;
    }

    if (isRange) {
      result.fromDate = value.resourceRange.start;
      result.tillDate = value.resourceRange.end;
    } else {
      if (value.intervalFrom === "date") {
        result.fromDate = value.resourceDate;
      }

      if (value.intervalTo === "date") {
        result.tillDate = value.resourceDate;
      }
    }
    return result;
  }

  private mapForBackend(value: any) {
    const isRange =
      value.intervalFrom === "date" && value.intervalTo === "date";
    const result: any = {
      type: value.type,
    };

    if (value.type === "none") {
      return result;
    }

    if (value.type === "at") {
      result.resourceDate = value.atDate;
      return result;
    }

    if (this.showTimezone()) {
      result.timezone = this.temporalForm.get("timezone")?.value;
    }

    return {
      ...result,
      intervalFrom: value.intervalFrom,
      intervalTo: value.intervalTo,
      ...(isRange
        ? {
            resourceRange: {
              start: value.fromDate,
              end: value.tillDate,
            },
          }
        : {
            resourceDate: this.getDateInFromOrTo(value),
          }),
    };
  }

  private handleTimezoneState(value: any) {
    const shouldShow = value.type !== "none";
    this.showTimezone.set(this.props.showTimezone && shouldShow);
  }

  private handleDisabledStates(value: any) {
    if (value.type === "at") {
      this.temporalForm.get("atDate").enable({ emitEvent: false });
      this.temporalForm.get("fromDate").disable({ emitEvent: false });
      this.temporalForm.get("tillDate").disable({ emitEvent: false });
    } else {
      this.temporalForm.get("atDate").disable({ emitEvent: false });

      if (value.intervalFrom === "date") {
        this.temporalForm.get("fromDate").enable({ emitEvent: false });
      } else {
        this.temporalForm.get("fromDate").disable({ emitEvent: false });
      }
      if (value.intervalTo === "date") {
        this.temporalForm.get("tillDate").enable({ emitEvent: false });
      } else {
        this.temporalForm.get("tillDate").disable({ emitEvent: false });
      }
    }
  }

  private getDateInFromOrTo(value: any) {
    if (value.type === "at") return value.atDate;

    return value.intervalFrom === "date"
      ? value.fromDate
      : value.intervalTo === "date"
        ? value.tillDate
        : undefined;
  }

  private search(value: string): Partial<SelectOption>[] {
    let filter = value.toLowerCase();
    return timezones.filter(
      (option) => option.label.toLowerCase().indexOf(filter) !== -1,
    );
  }
}
