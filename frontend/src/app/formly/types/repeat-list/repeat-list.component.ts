import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FieldArrayType, FormlyFieldConfig } from "@ngx-formly/core";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { filter, map, startWith, take, tap } from "rxjs/operators";
import { merge, Observable, of, Subject } from "rxjs";
import { SelectOption } from "../../../services/codelist/codelist.service";
import { FormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { CdkDragDrop } from "@angular/cdk/drag-drop";

@UntilDestroy()
@Component({
  selector: "ige-repeat-list",
  templateUrl: "./repeat-list.component.html",
  styleUrls: ["./repeat-list.component.scss"],
})
export class RepeatListComponent extends FieldArrayType implements OnInit {
  @ViewChild("repeatListInput", { read: ElementRef })
  autoCompleteEl: ElementRef;
  @ViewChild(MatAutocompleteTrigger) autoComplete: MatAutocompleteTrigger;

  filteredOptions: Observable<SelectOption[]>;
  parameterOptions: SelectOption[];
  parameterOptions$: Observable<SelectOption[]>;
  inputControl = new FormControl();
  private manualUpdate = new Subject<string>();

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.to.options instanceof Observable) {
      this.to.options
        .pipe(
          untilDestroyed(this),
          filter((data) => data !== undefined && data.length > 0),
          take(1),
          tap((data) => this.initInputListener(data))
        )
        .subscribe();
    } else {
      this.initInputListener(this.to.options);
    }
  }

  private initInputListener(options: SelectOption[]) {
    this.parameterOptions = options;
    this.parameterOptions$ = of(this.parameterOptions);

    // show error immediately (on publish)
    this.inputControl.markAllAsTouched();

    this.filteredOptions = merge(
      this.formControl.valueChanges,
      this.inputControl.valueChanges,
      this.manualUpdate.asObservable()
    ).pipe(
      untilDestroyed(this),
      startWith(""),
      filter((value) => value !== undefined && value !== null),
      map((value) => this._filter(value)),
      map((value) => this._markSelected(value))
    );
  }

  addToList(value: any) {
    // ignore duplicate entries
    if (value === "" || this.model.indexOf(value) !== -1) {
      return;
    }

    this.add(null, value);

    this.inputControl.setValue(null);

    if (!this.to.asSelect) {
      // element successfully added when input was blurred
      this.autoCompleteEl.nativeElement.blur();
      this.autoComplete.closePanel();
      setTimeout(() => this.autoCompleteEl.nativeElement.focus());
    } else {
      if (this._filter("").length === 0) {
        this.inputControl.disable();
      }
      setTimeout(() => this.inputControl.setValue(""));
    }
  }

  private _filter(value): SelectOption[] {
    if (!value) {
      return this.parameterOptions;
    }
    return this.parameterOptions?.filter((option) => option.value !== value);
  }

  private _markSelected(value: SelectOption[]): SelectOption[] {
    return value?.map((option) => {
      if (this.model.indexOf(option.value) !== -1) {
        option.disabled = true;
      } else {
        option.disabled = false;
      }
      return option;
    });
  }

  removeItem(index: number) {
    this.remove(index);
    this.manualUpdate.next("");

    if (this.to.asSelect && this.inputControl.disabled) {
      this.inputControl.enable();
    }
  }

  drop(event: CdkDragDrop<FormlyFieldConfig>) {
    const item = this.model[event.previousIndex];
    this.remove(event.previousIndex);
    this.add(event.currentIndex, item);
  }
}
