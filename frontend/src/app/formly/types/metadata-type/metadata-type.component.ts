import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from "@ngx-formly/core";
import { FormLabelComponent } from "../../wrapper/form-label/form-label.component";
import { JsonPipe, NgIf } from "@angular/common";
import {
  MatChip,
  MatChipListbox,
  MatChipListboxChange,
  MatChipOption,
  MatChipSelectionChange,
} from "@angular/material/chips";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged, startWith } from "rxjs/operators";

export interface MetadataProps extends FormlyFieldProps {
  availableOptions: MetadataOption[];
  disabledOptions: { [key: string]: boolean };
  externalLabel: string;
  hasContextHelp: boolean;
}

export interface MetadataOption {
  label: string;
  typeOptions: MetadataOptionItems[];
}

export interface MetadataOptionItems {
  key?: string;
  multiple: boolean;
  hidden?: boolean;
  hide?: (field: FormlyFieldConfig) => boolean;
  items: MetadataOptionItem[];
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
        this.aForm.patchValue(
          { ...this.cleanForm, ...data },
          {},
          // { emitEvent: false },
        );

        // typeOption.onChange?.(this.field, $event.value);
        // let options = this.props.availableOptions;
        // if (options[1].typeOptions.length > 1)
        // options[1].typeOptions[1].hidden = !data.isInspireIdentified;
        // this.displayedOptions.set(options);
      });
    this.aForm.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      )
      .subscribe((data) => {
        console.log(data);
        this.previousValue = this.formControl.value;
        this.formControl.setValue(data);
        this.props.change(this.field, this.previousValue);
      });
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
    item.onClick?.(this.field, this.previousValue);
  }

  handleChange(typeOption: MetadataOptionItems, $event: MatChipListboxChange) {
    console.log("option changed", $event);
    this.previousValue = this.formControl.value;
    typeOption.onChange?.(this.field, $event.value);
  }

  handleOptionChange(
    typeOption: MetadataOptionItems,
    $event: MatChipSelectionChange,
  ) {
    console.log(
      "single option changed aForm",
      this.aForm.value[typeOption.key],
    );
    // this.previousValue = this.formControl.value;
    // typeOption.onChange?.(this.field, $event.value);
  }
}
