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
import { Component, OnInit, signal } from "@angular/core";
import {
  FieldArrayType,
  FieldGroupTypeConfig,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
  FormlyModule,
} from "@ngx-formly/core";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { clone, groupByWithIndexReference } from "../../../shared/utils";
import { debounceTime, startWith, tap } from "rxjs/operators";
import { FormErrorComponent } from "../../../+form/form-shared/ige-form-error/form-error.component";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIconButton } from "@angular/material/button";
import { AddButtonComponent } from "../../../shared/add-button/add-button.component";

export interface RepeatProps extends FormlyFieldProps {
  menuOptions: {
    key: string;
    value: any;
    fields: FormlyFieldConfig<FieldGroupTypeConfig>;
  }[];
  noDrag: boolean;
  ariaLabel: string;
  hasExtendedGap: boolean;
  showBorder: boolean;
  addButtonTitle: string;
}

@UntilDestroy()
@Component({
  selector: "ige-repeat",
  templateUrl: "./repeat.component.html",
  styleUrls: ["./repeat.component.scss"],
  standalone: true,
  imports: [
    FormErrorComponent,
    FormlyModule,
    CdkDropList,
    CdkDrag,
    MatIcon,
    CdkDragHandle,
    MatTooltip,
    MatIconButton,
    AddButtonComponent,
  ],
})
export class RepeatComponent
  extends FieldArrayType<FieldTypeConfig<RepeatProps>>
  implements OnInit
{
  canBeDragged = false;

  groupedFields: any;
  groupedFieldsKeys = signal<string[]>([]);
  menuSections: any;

  ngOnInit(): void {
    this.menuSections =
      this.field.props.menuOptions?.reduce((res, cur) => {
        res[cur.key] = cur.value;
        return res;
      }, {}) ?? null;

    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        startWith(this.formControl.value as any[]),
        debounceTime(0),
        tap((value) => this.createGroupedFields(value)),
      )
      .subscribe((value) => this.updateDragState(value));
  }

  drop(event: CdkDragDrop<FormlyFieldConfig>) {
    moveItemInArray(
      this.field.fieldGroup,
      event.previousIndex,
      event.currentIndex,
    );
    moveItemInArray(this.model, event.previousIndex, event.currentIndex);

    for (let i = 0; i < this.field.fieldGroup.length; i++) {
      this.field.fieldGroup[i].key = `${i}`;
    }
    this.options.build(this.field);
    this.createGroupedFields(this.formControl.value);
  }

  onPopulate(field: FieldTypeConfig<RepeatProps>) {
    if (!field.props.menuOptions) {
      super.onPopulate(field);
      return;
    }

    const initialLength = field.fieldGroup?.length ?? 0;
    super.onPopulate(field);

    const length = field.model ? field.model.length : 0;

    for (let i = initialLength; i < length; i++) {
      const fields = this.getFieldsFromModelType(field, field.model[i]._type);
      field.fieldGroup[i] = { ...clone(fields), key: `${i}` };
    }
  }

  private getFieldsFromModelType(
    field: FieldTypeConfig<RepeatProps>,
    type: string,
  ) {
    return field.props.menuOptions.find((opt) => opt.key === type)?.fields;
  }

  addItem(type?: string) {
    if (this.field.props.menuOptions) {
      this.add(null, { _type: type });
    } else {
      this.add();
    }
  }

  private updateDragState(value: any) {
    this.canBeDragged =
      this.formControl.enabled &&
      !this.field.props.menuOptions &&
      !this.props.noDrag &&
      value?.length > 1;
  }

  private createGroupedFields(value: any[]) {
    this.groupedFields = groupByWithIndexReference(value, (i) => i._type);
    this.groupedFieldsKeys.set(Object.keys(this.groupedFields));
  }
}
