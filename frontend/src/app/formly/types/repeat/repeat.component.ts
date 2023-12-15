/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import {
  FieldArrayType,
  FieldArrayTypeConfig,
  FormlyFieldConfig,
} from "@ngx-formly/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { clone, groupByWithIndexReference } from "../../../shared/utils";
import { startWith, tap } from "rxjs/operators";

@UntilDestroy()
@Component({
  selector: "ige-repeat",
  templateUrl: "./repeat.component.html",
  styleUrls: ["./repeat.component.scss"],
})
export class RepeatComponent extends FieldArrayType implements OnInit {
  canBeDragged = false;

  groupedFields;
  groupedFieldsKeys: string[] = [];
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

  onPopulate(field: FieldArrayTypeConfig) {
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
    field: FieldArrayTypeConfig<FormlyFieldConfig["props"]>,
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

  private updateDragState(value) {
    this.canBeDragged =
      this.formControl.enabled &&
      !this.field.props.menuOptions &&
      !this.props.noDrag &&
      value?.length > 1;
  }

  private createGroupedFields(value: any[]) {
    this.groupedFields = groupByWithIndexReference(value, (i) => i._type);
    this.groupedFieldsKeys = Object.keys(this.groupedFields);
  }
}
