import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FieldType } from "@ngx-formly/material/form-field";
import { MatSelect, MatSelectChange } from "@angular/material/select";
import { FormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatPseudoCheckboxState } from "@angular/material/core";
import { filter, take, tap } from "rxjs/operators";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";

@UntilDestroy()
@Component({
  selector: "ige-select-type",
  templateUrl: "./select-type.component.html",
  styleUrls: ["./select-type.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectTypeComponent extends FieldType implements OnInit {
  @ViewChild(MatSelect, { static: true }) formFieldControl!: MatSelect;

  defaultOptions = {
    templateOptions: {
      options: [],
      compareWith(o1: any, o2: any) {
        return o1 === o2;
      },
    },
  };

  selectControl = new FormControl();

  private selectAllValue!: { options: any; value: any[] };
  selectOptions: any[];
  private optionsLoaded$ = new BehaviorSubject<boolean>(false);

  ngOnInit() {
    super.ngOnInit();

    combineLatest([this.formControl.valueChanges, this.optionsLoaded$])
      .pipe(
        untilDestroyed(this),
        filter(([value, ready]) => ready),
        tap(([value]) => this.updateSelectField(value))
      )
      .subscribe();

    let options = this.to.options as Observable<any[]>;
    if (!(options instanceof Observable)) {
      options = of(options);
    }
    options
      .pipe(
        untilDestroyed(this),
        filter((data) => data !== undefined && data.length > 0),
        take(1),
        tap((data) => (this.selectOptions = data)),
        tap(() => this.optionsLoaded$.next(true)),
        tap(() => this.updateSelectField(this.formControl.value))
      )
      .subscribe();
  }

  private updateSelectField(value) {
    if (this.to.simple) {
      this.selectControl.setValue(value, { emitEvent: false });
    } else {
      this.selectControl.setValue(value?.key, {
        emitEvent: false,
      });
    }
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
    this.selectControl.setValue(
      !this.value || this.value.length !== selectAllValue.length
        ? selectAllValue
        : []
    );

    this.selectControl.markAsDirty();
  }

  change($event: MatSelectChange) {
    if (this.to.change) {
      this.to.change(this.field, $event);
    }
    if (this.to.simple) {
      this.formControl.setValue($event.value);
    } else {
      this.formControl.setValue(
        $event.value === undefined ? null : { key: $event.value }
      );
    }

    this.formControl.markAsTouched();
  }

  _getAriaLabelledby(): string {
    if (this.to.attributes && this.to.attributes["aria-labelledby"]) {
      return this.to.attributes["aria-labelledby"] + "";
    }

    if (this.formField && this.formField._labelId) {
      return this.formField._labelId;
    }

    return undefined;
  }

  _getAriaLabel() {
    return this.to.attributes ? this.to.attributes["aria-label"] : undefined;
  }

  private getSelectAllValue(options: any[]) {
    if (!this.selectAllValue || options !== this.selectAllValue.options) {
      const flatOptions: any[] = [];
      options.forEach((o) =>
        o.group ? flatOptions.push(...o.group) : flatOptions.push(o)
      );

      this.selectAllValue = {
        options,
        value: flatOptions.filter((o) => !o.disabled).map((o) => o.value),
      };
    }

    return this.selectAllValue.value;
  }
}
