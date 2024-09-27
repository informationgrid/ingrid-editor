import { Component, DestroyRef, inject, OnInit } from "@angular/core";
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
  MatChipOption,
} from "@angular/material/chips";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime } from "rxjs/operators";

export interface MetadataProps extends FormlyFieldProps {
  availableOptions: MetadataOption[];
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
  items: MetadataOptionItem[];
}

export interface MetadataOptionItem {
  key?: string;
  label: string;
  value: any;
  onClick?: (field: FormlyFieldConfig) => void;
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

  ngOnInit(): void {
    this.initForm();
    this.formControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(10))
      .subscribe((data) => {
        this.aForm.patchValue(
          { ...this.cleanForm, ...data },
          { emitEvent: false },
        );
      });
    this.aForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        console.log(data);
        this.formControl.setValue(data);
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
    this.cleanForm = this.aForm.getRawValue();
  }

  handleOptionClick(item: MetadataOptionItem) {
    item.onClick?.(this.field);
  }
}
