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
import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { Observable, of } from "rxjs";
import { filter, map, startWith, tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { SelectOptionUi } from "../../services/codelist/codelist.service";
import { FieldTypeConfig } from "@ngx-formly/core";
import { BackendOption } from "../../store/codelist/codelist.model";

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
  parameterOptions: BackendOption[] = [];
  filteredOptions: BackendOption[];

  displayFn(option: BackendOption | string): string {
    if (this.props.simple) return <string>option;

    const opt = <BackendOption>option;
    if (opt?.key) {
      return opt.value ?? this.getValueFromOptionKey(opt.key) ?? "???";
    }
    return opt && opt.value ? opt.value : "";
  }

  ngOnInit() {
    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        startWith(<string>this.formControl.value ?? ""),
        map((value) => {
          let name = typeof value === "string" ? value : value?.value;

          if (!this.props.simple) {
            if (typeof value === "string") {
              const key =
                this.parameterOptions.find((option) => option.value === value)
                  ?.key ?? null;

              if (key === null && !value) {
                this.formControl.setValue(null);
              } else if (key === null) {
                this.formControl.setValue({ key: null, value: value });
              } else {
                this.formControl.setValue({ key: key });
              }
              return null;
            } else if (value?.key != null && value?.value !== undefined) {
              this.formControl.setValue({ key: value.key });
              return;
            } else if (value?.key != null && value?.value === undefined) {
              // values should have been filtered already
              return null;
            }
          }

          return this.filterParameterByName(name);
        }),
        filter((value) => value !== null),
      )
      .subscribe((values) => (this.filteredOptions = values));

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
    this.parameterOptions = options.map(
      (option) =>
        <BackendOption>{
          key: option.value,
          value: option.label,
          disabled: option.disabled,
        },
    );
    const value = this.getFormValueLabel();
    this.filteredOptions = this.filterParameterByName(value);
    this.formControl.setValue(this.formControl.value);
  }

  _filter(value: string): BackendOption[] {
    if (value === undefined || value === null || this.props.doNotFilter)
      return this.parameterOptions;
    const filterValue = value.toLowerCase();

    return this.parameterOptions
      ? this.parameterOptions.filter((option) =>
          option.value.toLowerCase().includes(filterValue),
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
    return this.parameterOptions.find((param) => param.key === key)?.value;
  }

  private filterParameterByName(name) {
    return name ? this._filter(name) : this.parameterOptions.slice();
  }
}
