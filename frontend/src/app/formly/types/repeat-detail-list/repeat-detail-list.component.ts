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
import { Component, OnInit } from "@angular/core";
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
  FormlyModule,
} from "@ngx-formly/core";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import {
  FormDialogComponent,
  FormDialogData,
} from "../table/form-dialog/form-dialog.component";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from "@angular/cdk/drag-drop";
import { MatListModule } from "@angular/material/list";
import { AsyncPipe, JsonPipe, KeyValuePipe } from "@angular/common";
import { SharedPipesModule } from "../../../directives/shared-pipes.module";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { AddButtonModule } from "../../../shared/add-button/add-button.module";
import { MatButtonModule } from "@angular/material/button";
import { FormErrorComponent } from "../../../+form/form-shared/ige-form-error/form-error.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FieldType } from "@ngx-formly/material";

interface RepeatDetailListProps extends FormlyFieldProps {
  titleField: string;
  fields: FormlyFieldConfig[];
}

@Component({
  selector: "ige-repeat-detail-list",
  templateUrl: "./repeat-detail-list.component.html",
  styleUrls: ["./repeat-detail-list.component.scss"],
  imports: [
    AsyncPipe,
    CdkDrag,
    CdkDropList,
    CdkDragHandle,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    AddButtonModule,
    MatButtonModule,
    SharedPipesModule,
    FormErrorComponent,
    KeyValuePipe,
    FormlyModule,
    MatTooltipModule,
    JsonPipe,
  ],
  standalone: true,
})
export class RepeatDetailListComponent
  extends FieldType<FieldTypeConfig<RepeatDetailListProps>>
  implements OnInit
{
  constructor(private dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {}

  addItem() {
    this.openDialog(null);
  }

  editItem(index: number) {
    this.openDialog(index);
  }

  private openDialog(index?: number) {
    this.dialog
      .open(FormDialogComponent, {
        width: "90vw",
        maxWidth: "950px",
        data: <FormDialogData>{
          fields: this.props.fields,
          model:
            index === null
              ? {}
              : JSON.parse(
                  JSON.stringify(this.model[this.field.key + ""][index]),
                ),
          formState: { mainModel: { _type: this.formState.mainModel?._type } },
        },
      })
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          this.replaceItem(index, response);
        }
      });
  }

  drop(event: CdkDragDrop<FormlyFieldConfig>) {
    const item = this.model[this.field.key + ""][event.previousIndex];
    this.replaceItem(event.currentIndex, item, event.previousIndex);
  }

  replaceItem(index: number, item: any, previousIndex: number = null) {
    if (previousIndex !== null) {
      this.removeItem(previousIndex);
    } else if (index !== null) {
      this.removeItem(index);
    }
    const value: any[] = this.formControl.value || [];
    if (index === null) {
      value.push(item);
    } else {
      value.splice(index, 0, item);
    }
    this.formControl.patchValue([...value]);
    this.formControl.markAsDirty();
    this.formControl.markAsTouched();
  }

  removeItem(index: number) {
    this.formControl.patchValue(
      [...(this.formControl.value || [])].filter((_, idx) => idx !== index),
    );
    this.formControl.markAsDirty();
    this.formControl.markAsTouched();
  }
}
