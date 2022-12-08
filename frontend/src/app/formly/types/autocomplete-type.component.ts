import { Component, OnInit, ViewChild } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { MatInput } from "@angular/material/input";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { distinct, filter, map, startWith, tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { SelectOptionUi } from "../../services/codelist/codelist.service";
import { FormControl, UntypedFormControl } from "@angular/forms";
import { FieldTypeConfig } from "@ngx-formly/core";

@UntilDestroy()
@Component({
  selector: "ige-formly-autocomplete-type",
  templateUrl: "./autocomplete-type.component.html",
  styleUrls: ["./autocomplete-type.component.scss"],
})
export class AutocompleteTypeComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  @ViewChild(MatInput, { static: true }) formFieldControl: MatInput;
  @ViewChild(MatAutocompleteTrigger, { static: true })
  autocomplete: MatAutocompleteTrigger;

  private parameterOptions: SelectOptionUi[] = [];
  filteredOptions: SelectOptionUi[] = [];
  private optionsLoaded$ = new BehaviorSubject<boolean>(false);

  input: FormControl = new UntypedFormControl();

  ngOnInit() {
    combineLatest([this.formControl.valueChanges, this.optionsLoaded$])
      .pipe(
        /*distinctUntilChanged(
          ([a], [b]) => JSON.stringify(a) === JSON.stringify(b)
        ),*/
        filter(([_, ready]) => ready),
        map(([value]) => this.mapOptionToValue(value))
      )
      .subscribe((label) => {
        this.input.setValue(label, { emitEvent: false });
        this.filteredOptions = this._filter(label);
      });

    this.addDisableBehaviour();

    let options = this.props.options as Observable<any[]>;
    if (!(options instanceof Observable)) {
      options = of(options);
    }
    options
      .pipe(
        untilDestroyed(this),
        filter((data) => data !== undefined),
        // take(1),
        tap((data) => this.initInputListener(data))
      )
      .subscribe();
  }

  private addDisableBehaviour() {
    this.formControl.statusChanges
      .pipe(untilDestroyed(this))
      .subscribe((status) =>
        status === "DISABLED" ? this.input.disable() : this.input.enable()
      );

    if (this.formControl.disabled) {
      this.input.disable();
    }
  }

  private initInputListener(options: SelectOptionUi[]) {
    this.parameterOptions = options;

    this.input.valueChanges
      .pipe(
        untilDestroyed(this),
        tap((value) => console.log("value: ", value)),
        startWith(this.mapOptionToValue(this.formControl.value)),
        // distinct(), // will not let through empty value!
        tap((value) => this.updateFormControl(value))
      )
      .subscribe((value) => (this.filteredOptions = this._filter(value)));

    this.optionsLoaded$.next(true);
    const label = this.mapOptionToValue(this.formControl.value);
    this.input.setValue(label, { emitEvent: false });
    this.formControl.markAsUntouched();
  }

  private mapOptionToValue(value: any): string {
    if (this.props.simple) return value;

    if (value?.key) {
      return (
        this.parameterOptions.find((option) => option.value === value.key)
          ?.label ?? ""
      );
    } else {
      return value?.value ?? "";
    }
  }

  private updateFormControl(value: string) {
    if (this.props.simple) {
      this.formControl.setValue(value);
      this.formControl.markAsTouched();
      this.formControl.markAsDirty();

      return;
    }

    const key =
      this.parameterOptions.find((option) => option.label === value)?.value ??
      null;

    const hasSameKey = key !== null && key === this.formControl.value?.key;
    const hasSameValue =
      key === null && value === this.formControl.value?.value;
    const hasSameNullValue = !this.formControl.value && key === null && !value;

    if (hasSameKey || hasSameValue || hasSameNullValue) {
      return;
    }

    if (key === null && !value) {
      this.formControl.setValue(null);
    } else if (key === null) {
      this.formControl.setValue({ key: null, value: value });
    } else {
      this.formControl.setValue({ key: key });
    }

    this.formControl.markAsTouched();
    this.formControl.markAsDirty();
  }

  _filter(value: string): SelectOptionUi[] {
    if (value === undefined || value === null || this.props.doNotFilter)
      return this.parameterOptions;
    const filterValue = value.toLowerCase();

    return this.parameterOptions
      ? this.parameterOptions
          ?.map((option) => {
            option.disabled = !option.label.toLowerCase().includes(filterValue);
            return option;
          })
          .filter((option) => !option.disabled || this.props.highlightMatches)
      : [];
  }

  openAutocompletePanel() {
    this.autocomplete.openPanel();
  }
}
