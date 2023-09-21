import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FieldArrayType } from "@ngx-formly/core";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { debounceTime, filter, map, startWith, tap } from "rxjs/operators";
import {
  BehaviorSubject,
  merge,
  Observable,
  of,
  Subject,
  Subscription,
} from "rxjs";
import {
  SelectOption,
  SelectOptionUi,
} from "../../../services/codelist/codelist.service";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  UntypedFormControl,
  ValidationErrors,
} from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatSelect } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ErrorStateMatcher } from "@angular/material/core";
import { CodelistQuery } from "../../../store/codelist/codelist.query";

class MyErrorStateMatcher implements ErrorStateMatcher {
  constructor(private component: RepeatListComponent) {}

  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    if (control?.invalid) return control.invalid && !this.component.hasFocus;
    else return false;
  }
}

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
  @ViewChild(MatSelect) selector: MatSelect;

  onItemClick: (id: number) => void = () => {};

  mustBeEmptyValidator = (otherControl) => {
    return (ctrl): ValidationErrors => {
      const validateCtrl = otherControl ?? ctrl;
      return validateCtrl.value === null || validateCtrl.value === ""
        ? null
        : {
            mustBeEmpty: true,
          };
    };
  };

  filteredOptions: Observable<SelectOptionUi[]>;
  parameterOptions: SelectOptionUi[];
  initialParameterOptions: SelectOptionUi[];
  parameterOptions$: Observable<SelectOptionUi[]>;
  inputControl = new FormControl<string>("");
  filterCtrl: UntypedFormControl;
  searchSub: Subscription;
  searchResult = new BehaviorSubject<any[]>([]);
  private manualUpdate = new Subject<string>();
  private currentStateRequired = false;
  type: "simple" | "select" | "autocomplete" | "search" = "simple";
  hasFocus = false;
  matcher = new MyErrorStateMatcher(this);

  constructor(
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private codelistQuery: CodelistQuery
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.props.asSelect) {
      this.type = "select";
      if (this.props.showSearch) {
        this.filterCtrl = new FormControl<string>("");
        this.filterCtrl.valueChanges
          .pipe(untilDestroyed(this))
          .subscribe((value) => this.manualUpdate.next(value));
      }
    } else if (this.props.restCall) {
      this.type = "search";
      if (!this.props.labelField) this.props.labelField = "label";
      if (!this.props.selectLabelField)
        this.props.selectLabelField = this.props.labelField;
    } else if (
      this.props.asAutocomplete ||
      (this.props.options && !this.props.asSelect && !this.props.restCall)
    ) {
      this.type = "autocomplete";
      if (!this.props.hint) this.props.hint = "Eingabe mit RETURN bestätigen";
    }

    if (this.props.options instanceof Observable) {
      this.props.options
        .pipe(
          untilDestroyed(this),
          filter((data) => data !== undefined),
          // take(1),
          tap((data) => this.initInputListener(data)),
          tap(() => this.cdr.detectChanges())
        )
        .subscribe();
    } else {
      this.initInputListener(this.props.options);
    }

    if (this.props.onItemClick) {
      this.onItemClick = this.props.onItemClick;
    }
  }

  private initInputListener(options: SelectOptionUi[]) {
    // create copies to not change the original options
    if (options) {
      const optionsAsString = JSON.stringify(options);
      this.parameterOptions = JSON.parse(optionsAsString);
      this.initialParameterOptions = JSON.parse(optionsAsString);
    }
    this.parameterOptions$ = of(this.parameterOptions);

    // show error immediately (on publish)
    this.inputControl.markAllAsTouched();

    if (this.type !== "select") {
      this.formControl.addValidators(
        this.mustBeEmptyValidator(this.inputControl)
      );
      this.inputControl.addValidators(
        this.mustBeEmptyValidator(this.inputControl)
      );
    }

    this.formControl.statusChanges
      .pipe(untilDestroyed(this))
      .subscribe((status) => {
        this.handleRequiredState();
        status === "DISABLED"
          ? this.inputControl.disable()
          : this.inputControl.enable();
      });

    if (this.props.restCall) {
      this.inputControl.valueChanges
        .pipe(
          untilDestroyed(this),
          startWith(""),
          debounceTime(300),
          filter((query) => query?.length > 1)
        )
        .subscribe((query) => this.search(query));
    } else {
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
  }

  addToList(option: SelectOptionUi) {
    if (this.selector && !this.selector.panelOpen) {
      // this.inputControl.setValue("");
      setTimeout(() => this.selector.open());
      return;
    }

    if (this.props.asSimpleValues) {
      this.addSimpleValues(option.value);
      return;
    }

    // ignore duplicate entries
    const containsCodelistItem =
      option.value &&
      this.model?.map((item) => item.key)?.indexOf(option.value) !== -1;
    const containsFreeEntry =
      option.label &&
      this.model?.map((item) => item.value)?.indexOf(option.label) !== -1;
    if (option.value === "" || containsCodelistItem || containsFreeEntry) {
      return;
    }

    const prepared = new SelectOption(option.value, option.label).forBackend();
    this.add(null, prepared);
    this.props.change?.(this.field, prepared);

    this.inputControl.setValue(null);

    if (this.type === "autocomplete") {
      // element successfully added when input was blurred
      // this.autoCompleteEl?.nativeElement?.blur();
      // this.autoComplete?.closePanel();
      // setTimeout(() => this.autoCompleteEl?.nativeElement?.focus());
    } else if (this.type === "select") {
      if (this._filter(null)?.length === 0) {
        this.inputControl.disable();
      }
      setTimeout(() => this.inputControl.setValue(""));
    }

    // update validation message
    this.formControl.updateValueAndValidity();
  }

  addValueObject(value: any) {
    this.inputControl.setValue("");

    const label = value[this.props.labelField];
    const alreadyExists = this.model.some(
      (item) => item[this.props.labelField] == label
    );
    if (alreadyExists) {
      this.snack.open(`Der Begriff '${label}' existiert bereits`);
      return;
    }

    this.add(null, value);
  }

  private handleRequiredState() {
    if (this.props.required === this.currentStateRequired) return;
    let requiredValidator = (): ValidationErrors | null => {
      return !this.showError ||
        (this.props.required && this.formControl.value.length > 0)
        ? null
        : { required: "Pflicht!" };
    };

    if (this.props.required) {
      this.inputControl.addValidators(requiredValidator);
    } else {
      this.inputControl.removeValidators(requiredValidator);
    }
    this.inputControl.updateValueAndValidity();
  }

  private _filter(option: SelectOptionUi | string): SelectOptionUi[] {
    if (!option) {
      return this.parameterOptions;
    }

    if (typeof option === "string") {
      return this.parameterOptions?.filter(
        (originOption) =>
          originOption.label.toLowerCase().indexOf(option.toLowerCase()) !== -1
      );
    } else {
      return this.parameterOptions?.filter(
        (originOption) =>
          originOption.value.toLowerCase() !== option.value?.toLowerCase()
      );
    }
  }

  private search(value) {
    if (!value || value.length === 0) {
      this.searchResult.next([]);
      return;
    }
    this.searchSub?.unsubscribe();
    this.searchSub = this.props.restCall(value).subscribe((result) => {
      this.searchResult.next(result);
    });
    this.cdr.detectChanges();
  }

  private _markSelected(value: SelectOptionUi[]): SelectOptionUi[] {
    return value?.map((option) => {
      const disabledByDefault = this.initialParameterOptions.find(
        (item) => item.value === option.value
      ).disabled;
      const optionAlreadySelected = (<{ key; value? }[]>this.model)?.some(
        (modelOption) =>
          modelOption && (modelOption.key ?? modelOption) === option.value
      );
      option.disabled = disabledByDefault || optionAlreadySelected;
      return option;
    });
  }

  removeItem(index: number, $event?: KeyboardEvent) {
    const item = this.model[index];
    this.remove(index);
    this.props.remove?.(this.field, item);
    // delay, otherwise removed item will appear in input box
    setTimeout(() => this.manualUpdate.next(""));

    if (this.props.asSelect && this.inputControl.disabled) {
      this.inputControl.enable();
    }

    // focus next element when removed by keyboard
    if ($event) {
      const nextElement = ($event.currentTarget as HTMLElement)
        ?.nextElementSibling as HTMLElement;
      nextElement?.focus();
    }
  }

  drop(event: { previousIndex: number; currentIndex: number }) {
    const item = this.model[event.previousIndex];
    this.remove(event.previousIndex);
    this.add(event.currentIndex, item);
  }

  // TODO: do not use template function!
  getParameter(option: { key; value? }) {
    if (!option) return "";

    let optionKey: string;
    if (typeof option === "object") {
      optionKey = option.key;
    } else {
      optionKey = option;
    }

    return (
      this.parameterOptions?.find((param) => param.value === optionKey)
        ?.label ??
      option.value ??
      option
    );
  }

  getLabel(item): string {
    if (typeof this.props.selectLabelField === "function") {
      return this.props.selectLabelField(item);
    }

    return item[this.props.selectLabelField];
  }

  handleKeydown($event: KeyboardEvent) {
    if ($event.key !== "Escape") {
      $event.stopImmediatePropagation();
    }
  }

  onOptionClick($event: MouseEvent, option: SelectOptionUi) {
    if (option.disabled) {
      // do nothing
      return;
    }

    this.addToList(option);
    if (this.props.multiSelect || $event.ctrlKey) {
      // don't close the selection panel for multi select or ctrl key selection
    } else {
      this.selector.close();
    }
  }

  async addFreeEntry(value: string) {
    if (!value || value.trim() === "") return;

    // check if really free entry
    const option = this.parameterOptions?.find(
      (param) => param.label === value
    );
    this.addToList(option ?? new SelectOption(null, value));
  }

  async addSimpleValues(value: string) {
    let duplicates = this.addValueAndDetermineDuplicates(value);

    this.inputControl.setValue("");

    if (duplicates.length > 0) this.handleDuplicates(duplicates);
  }

  private addValueAndDetermineDuplicates(value: string) {
    const duplicates = [];
    value.split(",").forEach((item) => {
      let trimmed: any = item.trim();
      if (trimmed == "") return;

      if (this.props?.convert) {
        trimmed = this.props.convert(trimmed);
      }

      let found: boolean;
      if (trimmed instanceof Object) {
        found = this.model.find((item) => this.shallowEqual(item, trimmed));
      } else {
        found = this.model.indexOf(trimmed) !== -1;
      }

      if (!found) {
        this.add(null, trimmed);
      } else {
        if (trimmed instanceof Object) {
          if (duplicates.indexOf(item.trim()) == -1)
            duplicates.push(item.trim());
        } else {
          if (duplicates.indexOf(trimmed) == -1) duplicates.push(trimmed);
        }
      }
    });
    return duplicates;
  }

  private handleDuplicates(duplicates: any[]) {
    let formattedDuplicates = this.prepareDuplicatesForView(duplicates);
    this.snack.open(
      `Die Eingabe von ${formattedDuplicates} erfolgte mehrfach, wurde aber nur einmal übernommen.`
    );
  }

  private shallowEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let key of keys1) {
      if (object1[key] !== object2[key]) {
        return false;
      }
    }

    return true;
  }

  private prepareDuplicatesForView(duplicates: any[]) {
    if (this.props.codelistId) {
      duplicates = duplicates.map((dup) =>
        this.codelistQuery.getCodelistEntryValueByKey(
          this.props.codelistId,
          dup
        )
      );
    }
    duplicates = duplicates.map((dup) => `'${dup}'`);
    let formattedDuplicates: string;
    if (duplicates.length == 1) {
      formattedDuplicates = duplicates[0];
    } else {
      formattedDuplicates = duplicates
        .join(", ")
        .replace(/,([^,]*)$/, " und$1");
    }
    return formattedDuplicates;
  }
}
