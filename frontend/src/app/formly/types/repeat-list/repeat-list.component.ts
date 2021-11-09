import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FieldArrayType, FormlyFieldConfig } from "@ngx-formly/core";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { filter, map, startWith, take, tap } from "rxjs/operators";
import { merge, Observable, of, Subject } from "rxjs";
import {
  SelectOption,
  SelectOptionUi,
} from "../../../services/codelist/codelist.service";
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

  onItemClick: (id: number) => void = () => {};

  filteredOptions: Observable<SelectOptionUi[]>;
  parameterOptions: SelectOptionUi[];
  parameterOptions$: Observable<SelectOptionUi[]>;
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

    if (this.to.onItemClick) {
      this.onItemClick = this.to.onItemClick;
    }
  }

  private initInputListener(options: SelectOptionUi[]) {
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

  addToList(option: SelectOptionUi) {
    // ignore duplicate entries
    if (option.value === "" || this.model.indexOf(option.value) !== -1) {
      return;
    }

    const prepared = new SelectOption(option.value, option.label);
    this.add(null, prepared);

    this.inputControl.setValue(null);

    if (!this.to.asSelect) {
      // element successfully added when input was blurred
      this.autoCompleteEl.nativeElement.blur();
      this.autoComplete.closePanel();
      setTimeout(() => this.autoCompleteEl.nativeElement.focus());
    } else {
      if (this._filter(null).length === 0) {
        this.inputControl.disable();
      }
      setTimeout(() => this.inputControl.setValue(""));
    }
  }

  private _filter(option: SelectOptionUi): SelectOptionUi[] {
    if (!option) {
      return this.parameterOptions;
    }
    return this.parameterOptions?.filter(
      (originOption) => originOption.value !== option.value
    );
  }

  private _markSelected(value: SelectOptionUi[]): SelectOptionUi[] {
    return value?.map((option) => {
      option.disabled = (<SelectOptionUi[]>this.model).some(
        (modelOption) => modelOption.value === option.value
      );
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

  // TODO: do not use template function!
  getParameter(option: SelectOption) {
    return (
      this.parameterOptions?.find((param) => param.value + "" === option.value)
        ?.label ?? option.label
    );
  }
}
