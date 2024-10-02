import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from "@ngx-formly/core";
import { FormLabelComponent } from "../../wrapper/form-label/form-label.component";
import { AsyncPipe, JsonPipe, NgIf } from "@angular/common";
import {
  MatChip,
  MatChipListbox,
  MatChipOption,
} from "@angular/material/chips";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
} from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged, startWith } from "rxjs/operators";
import { FormErrorComponent } from "../../../+form/form-shared/ige-form-error/form-error.component";
import { TranslocoDirective } from "@ngneat/transloco";
import { MetadataTypeShortComponent } from "./metadata-type-short/metadata-type-short.component";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { Observable } from "rxjs";

export interface MetadataProps extends FormlyFieldProps {
  availableOptions: MetadataOption[];
  disabledOptions: { [key: string]: boolean };
  externalLabel: string;
  hasContextHelp: boolean;
}

export interface MetadataOption {
  label: string;
  required?: boolean;
  typeOptions: MetadataOptionItems[];
}

export interface MetadataOptionItems {
  key?: string;
  multiple: boolean;
  hidden?: boolean;
  hide?: (field: FormlyFieldConfig) => boolean;
  items?: MetadataOptionItem[];
  asyncItems?: Observable<MetadataOptionItem[]>;
  onChange?: (field: FormlyFieldConfig, value: any) => void;
}

export interface MetadataOptionItem {
  key?: string;
  label: string;
  value: any;
  hide?: boolean;
  onClick?: (field: FormlyFieldConfig, previousValue: any) => void;
}

@Component({
  selector: "ige-metadata-type",
  standalone: true,
  imports: [
    FormLabelComponent,
    NgIf,
    MatChipListbox,
    MatChip,
    MatChipOption,
    ReactiveFormsModule,
    JsonPipe,
    FormErrorComponent,
    TranslocoDirective,
    MetadataTypeShortComponent,
    MatButton,
    MatIcon,
    AsyncPipe,
  ],
  templateUrl: "./metadata-type.component.html",
  styleUrl: "./metadata-type.component.scss",
})
export class MetadataTypeComponent
  extends FieldType<FieldTypeConfig<MetadataProps>>
  implements OnInit
{
  private destroyRef = inject(DestroyRef);

  aForm: FormGroup = null;
  private cleanForm: any;

  displayedOptions = signal<MetadataOption[]>([]);
  private previousValue: any;
  showShort: boolean = true;
  hasOptionsSelected: boolean;

  compareChips(chip1: any, chip2: any): boolean {
    return chip1 && chip2 ? chip1.key === chip2.key : chip1 === chip2;
  }

  ngOnInit(): void {
    this.displayedOptions.set(this.props.availableOptions);
    this.initForm();
    this.formControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        startWith(this.formControl.value),
        debounceTime(10),
      )
      .subscribe((value) => {
        const data = value ?? {};
        this.aForm.patchValue({ ...this.cleanForm, ...data }, {});
        this.displayedOptions.set([...this.props.availableOptions]);
        // show short version only when at least one option was chosen
        if (!this.hasValue(data)) this.showShort = false;
        this.hasOptionsSelected = this.hasValue(data);
      });
    this.aForm.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      )
      .subscribe((data) => {
        console.log(data);
        this.previousValue = this.formControl.value;
        // this.formControl.setValue(data, { emitEvent: false });
        // this.formControl.setValue(data, { onlySelf: true });
        this.formControl.setValue(data);
        this.props.change(this.field, this.previousValue);
      });

    this.formControl.addValidators(
      (control: AbstractControl): ValidationErrors | null => {
        if (this.aForm.invalid) return { required: true };
        return null;
      },
    );
  }

  private hasValue(data) {
    return Object.values(data).some((value) => value);
  }

  showContextHelp(infoElement: HTMLElement) {
    /*
    this.contextHelpService.showContextHelp(
      this.profile,
      this.formStateService.metadata().docType,
      this.fieldId,
      this.props.externalLabel,
      infoElement,
    );
*/
  }

  private initForm() {
    const formDef = {};
    const optionsTop = this.props.availableOptions;

    optionsTop.forEach((topOption) => {
      const typeOptions = topOption.typeOptions;
      typeOptions.forEach((option) => {
        if (option.key !== undefined) {
          formDef[option.key] = new FormControl(undefined);
        } else {
          option.items.forEach((item) => {
            formDef[item.key] = new FormControl(undefined);
          });
        }
      });
    });

    this.aForm = new FormGroup(formDef);
    const initialValue = this.aForm.getRawValue();
    MetadataTypeComponent.removeNullOrEmptyFields(initialValue);
    this.formControl.setValue(initialValue);
    this.cleanForm = initialValue;
  }

  /**
   * Replace null or empty fields with undefined in order to remove them from the resulting form value.
   * @param obj
   */
  private static removeNullOrEmptyFields(obj: any) {
    for (const f in obj) {
      let p = obj[f];
      if (p === null || p === "") {
        obj[f] = undefined;
      } else if (typeof p === "object" && p !== null) {
        this.removeNullOrEmptyFields(p);
      }
    }
  }

  handleOptionClick(item: MetadataOptionItem) {
    this.formControl.markAsDirty();
    item.onClick?.(this.field, this.previousValue);
  }
}
