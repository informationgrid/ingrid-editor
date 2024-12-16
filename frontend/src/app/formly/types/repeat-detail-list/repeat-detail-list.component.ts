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
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
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
import { NgComponentOutlet } from "@angular/common";

import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { FormErrorComponent } from "../../../+form/form-shared/ige-form-error/form-error.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FieldType } from "@ngx-formly/material";
import {
  AddButtonComponent,
  AddButtonOptions,
} from "../../../shared/add-button/add-button.component";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime, startWith } from "rxjs/operators";

interface RepeatDetailListProps extends FormlyFieldProps {
  titleField: string;
  fields: FormlyFieldConfig[];
  _types?: AddButtonOptions[];
  viewComponent: any;
}

@UntilDestroy()
@Component({
  selector: "ige-repeat-detail-list",
  templateUrl: "./repeat-detail-list.component.html",
  styleUrls: ["./repeat-detail-list.component.scss"],
  imports: [
    CdkDrag,
    CdkDropList,
    CdkDragHandle,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    AddButtonComponent,
    MatButtonModule,
    FormErrorComponent,
    FormlyModule,
    MatTooltipModule,
    NgComponentOutlet,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepeatDetailListComponent
  extends FieldType<FieldTypeConfig<RepeatDetailListProps>>
  implements OnInit
{
  private dialog = inject(MatDialog);

  previewItems = signal<any[]>([]);

  ngOnInit(): void {
    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        startWith(this.formControl.value),
        debounceTime(0),
      )
      .subscribe((items) => this.previewItems.set(items));
  }

  addItem(type: string) {
    this.openDialog(type, null);
  }

  editItem(index: number) {
    this.openDialog(null, index);
  }

  private openDialog(type?: string, index?: number) {
    const existingModel =
      index == null
        ? null
        : JSON.parse(JSON.stringify(this.model[this.field.key + ""][index]));
    const dialogType: FormlyFieldConfig = {
      key: "_type",
      type: "input",
      defaultValue: type ?? this.props.fields["_type"],
      className: "hide",
    };
    this.dialog
      .open(FormDialogComponent, {
        width: "90vw",
        maxWidth: "950px",
        data: <FormDialogData>{
          fields: [...this.props.fields, dialogType],
          model: existingModel,
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
