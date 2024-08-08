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
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FieldType } from "@ngx-formly/material/form-field";
import { MatSelect, MatSelectChange } from "@angular/material/select";
import { UntypedFormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatPseudoCheckboxState } from "@angular/material/core";
import { debounceTime, filter, map, take, tap } from "rxjs/operators";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { FieldTypeConfig } from "@ngx-formly/core";
import { BackendOption } from "../../../store/codelist/codelist.model";

@UntilDestroy()
@Component({
  selector: "ige-select-type",
  templateUrl: "./select-type.component.html",
  styleUrls: ["./select-type.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectTypeComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  @ViewChild(MatSelect, { static: true }) formFieldControl!: MatSelect;

  public filterCtrl = new UntypedFormControl();

  defaultOptions = {
    props: {
      options: [],
    },
  };

  private selectAllValue!: { options: any; value: any[] };
  selectOptions: BackendOption[];
  filteredOptions: BackendOption[];
  private optionsLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    if (!this.props.simple && !this.props.compareWith) {
      this.props.compareWith = (o1: any, o2: any) => {
        return o1?.key === o2?.key;
      };
    } else if (this.props.simple) {
      this.props.compareWith = (o1: any, o2: any) => {
        return o1 === o2 || o1?.key === o2;
      };
    }

    this.filterCtrl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        this.filteredOptions = this.search(value);
      });

    combineLatest([this.formControl.valueChanges, this.optionsLoaded$])
      .pipe(
        untilDestroyed(this),
        debounceTime(0),
        filter(([, ready]) => ready),
        tap(([value]) => this.updateSelectField(value)),
      )
      .subscribe();

    let options = this.props.options as Observable<any[]>;
    if (!(options instanceof Observable)) {
      options = of(options);
    }
    options
      .pipe(
        untilDestroyed(this),
        filter((data) => data !== undefined && data.length > 0),
        take(1),
        map((options) =>
          options.map(
            (option) =>
              <BackendOption>{ key: option.value, value: option.label },
          ),
        ),
        tap((data) => (this.selectOptions = data)),
        tap((data) => (this.filteredOptions = data)),
        tap(() => this.optionsLoaded$.next(true)),
        tap(() => {
          let value = this.formControl.value;
          if (!value && this.props.useFirstValueInitially) {
            this.formControl.setValue(this.filteredOptions[0].key);
          }
          this.updateSelectField(value);
        }),
      )
      .subscribe();
  }

  private updateSelectField(value: any) {
    if (value === undefined) {
      // if value is undefined, set formControl to null
      this.formControl.setValue(null, { emitEvent: false });
    } else if (!this.props.simple) {
      // if not simple, value is an object. set as object
      if (value?.key != null && value?.value != null) {
        this.formControl.setValue({ key: value.key });
      } else if (value?.key === null && !value?.value) {
        this.formControl.setValue(null);
      }
    } else if (this.props.multiple) {
      // if simple and multiple, value is an array. set as array
      let simpleValues = value?.map((item) => item?.key ?? item) ?? null;
      this.formControl.setValue(simpleValues, { emitEvent: false });
    } else if (value?.key) {
      // if simple and not multiple, value is an object. set as string
      this.formControl.setValue(value.key);
    }
    this.cdr.detectChanges();
  }

  getSelectAllState(options: any[]): MatPseudoCheckboxState {
    if (this.empty || this.value.length === 0) {
      return "unchecked";
    }

    return this.value.length !== this.getSelectAllValue(options).length
      ? "indeterminate"
      : "checked";
  }

  toggleSelectAll(options: any[]) {
    const selectAllValue = this.getSelectAllValue(options);
    this.formControl.setValue(
      !this.value || this.value.length !== selectAllValue.length
        ? selectAllValue
        : [],
    );

    this.formControl.markAsDirty();
  }

  change($event: MatSelectChange) {
    if (this.props.change) {
      this.props.change(this.field, $event);
    }
  }

  _getAriaLabelledby(): string {
    if (this.props.attributes && this.props.attributes["aria-labelledby"]) {
      return this.props.attributes["aria-labelledby"] + "";
    }

    if (this.formField && this.formField._labelId) {
      return this.formField._labelId;
    }

    return undefined;
  }

  private getSelectAllValue(options: any[]) {
    if (!this.selectAllValue || options !== this.selectAllValue.options) {
      const flatOptions: any[] = [];
      options.forEach((o) =>
        o.group ? flatOptions.push(...o.group) : flatOptions.push(o),
      );

      this.selectAllValue = {
        options,
        value: flatOptions.filter((o) => !o.disabled).map((o) => o.value),
      };
    }

    return this.selectAllValue.value;
  }

  search(value: string) {
    let filter = value.toLowerCase();
    return this.selectOptions.filter(
      (option) => option.value.toLowerCase().indexOf(filter) !== -1,
    );
  }
}
