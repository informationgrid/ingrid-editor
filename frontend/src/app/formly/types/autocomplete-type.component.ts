/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import {
  Component,
  effect,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { Observable, of } from "rxjs";
import { debounceTime, filter, map, startWith, tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { SelectOptionUi } from "../../services/codelist/codelist.service";
import {
  FieldTypeConfig,
  FormlyAttributes,
  FormlyFieldProps,
  FormlyForm,
} from "@ngx-formly/core";
import { BackendOption } from "../../store/codelist/codelist.model";
import { MatInput } from "@angular/material/input";
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from "@angular/material/autocomplete";
import { ReactiveFormsModule } from "@angular/forms";
import { MatIconButton } from "@angular/material/button";
import { MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";
import { MatOption } from "@angular/material/core";

interface AutocompleteProps extends FormlyFieldProps {
  fieldLabel?: string;
  placeholder?: string;
  highlightMatches?: boolean;
  hideDeleteButton?: boolean;
  simple?: boolean;
  doNotFilter?: boolean;
  options?: any[] | Observable<any[]>;
  codelistId?: string;
  dynamicCodelistId?: Signal<string>;
}

@UntilDestroy()
@Component({
  selector: "ige-formly-autocomplete-type",
  templateUrl: "./autocomplete-type.component.html",
  styleUrls: ["./autocomplete-type.component.scss"],
  imports: [
    MatInput,
    MatAutocompleteTrigger,
    ReactiveFormsModule,
    MatIconButton,
    MatSuffix,
    MatIcon,
    MatAutocomplete,
    MatDivider,
    MatOption,
    FormlyAttributes,
  ],
})
export class AutocompleteTypeComponent
  extends FieldType<FieldTypeConfig<AutocompleteProps>>
  implements OnInit
{
  private parameterOptions: WritableSignal<BackendOption[]> = signal([]);
  filteredOptions: WritableSignal<BackendOption[]> = signal([]);
  private currentCodelistId: string;

  displayFn(option: BackendOption | string): string {
    if (this.props.simple) return <string>option;

    const opt = <BackendOption>option;
    if (opt?.key) {
      return opt.value ?? this.getValueFromOptionKey(opt.key) ?? "???";
    }
    return opt && opt.value ? opt.value : "";
  }
  constructor() {
    super();
    effect(() => {
      if (this.props.dynamicCodelistId) {
        this.currentCodelistId = this.props.dynamicCodelistId();
        this.formControl.setValue(
          this.formControl.value?.value ?? this.formControl.value,
        );
      }
    });
  }

  ngOnInit() {
    this.currentCodelistId = this.props.codelistId
      ? this.props.codelistId
      : this.props.dynamicCodelistId?.();
    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        startWith(<string>this.formControl.value ?? ""),
        debounceTime(0),
        map((value) => {
          let name = typeof value === "string" ? value : value?.value;

          if (!this.props.simple) {
            if (typeof value === "string") {
              const key =
                this.parameterOptions().find((option) => option.value === value)
                  ?.key ?? null;

              if (key === null && (!value || value.trim().length === 0)) {
                this.formControl.setValue(null);
              } else {
                this.formControl.setValue({
                  key: key,
                  value: value,
                  _codelistId: this.currentCodelistId ?? null,
                });
              }
              return null;
            } else if (value?.key != null && value?.value === undefined) {
              // values should have been filtered already
              return null;
            }
          }

          return this.filterParameterByName(name);
        }),
        filter((value) => value !== null),
      )
      .subscribe((values) => this.filteredOptions.set(values));

    let options = this.props.options as Observable<any[]>;
    if (!(options instanceof Observable)) {
      options = of(options);
    }
    options
      .pipe(
        untilDestroyed(this),
        filter((data) => data !== undefined),
        // take(1),
        tap((data) => this.initInputListener(data)),
      )
      .subscribe();
  }

  private initInputListener(options: SelectOptionUi[]) {
    this.parameterOptions.set(
      options.map(
        (option) =>
          <BackendOption>{
            key: option.value,
            value: option.label,
            _codelistId: this.currentCodelistId ?? null,
            disabled: option.disabled,
          },
      ),
    );
    const value = this.getFormValueLabel();
    this.filteredOptions.set(this.filterParameterByName(value));
    this.formControl.setValue(this.formControl.value);
  }

  _filter(value: string): BackendOption[] {
    if (value === undefined || value === null || this.props.doNotFilter)
      return this.parameterOptions();
    const filterValue = value.toLowerCase();

    return this.parameterOptions
      ? this.parameterOptions().filter((option) =>
          option.value?.toLowerCase()?.includes(filterValue),
        )
      : [];
  }

  private getFormValueLabel(): string {
    const formValue = this.formControl.value;
    if (formValue === undefined || formValue === null) return null;
    if (this.props.simple) return formValue ?? null;

    return formValue.value ?? this.getValueFromOptionKey(formValue.key);
  }

  private getValueFromOptionKey(key: string) {
    return this.parameterOptions().find((param) => param.key === key)?.value;
  }

  private filterParameterByName(name: string) {
    return name ? this._filter(name) : this.parameterOptions().slice();
  }

  itemId(option: BackendOption) {
    return option.key ?? option;
  }
}
