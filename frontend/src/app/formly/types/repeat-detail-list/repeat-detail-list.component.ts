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
import {
  AsyncPipe,
  JsonPipe,
  KeyValuePipe,
  NgForOf,
  NgIf,
} from "@angular/common";
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
    NgIf,
    NgForOf,
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
    if (index !== null) {
      this.removeItem(index);
    }
    const value: any[] = this.formControl.value || [];
    value.splice(index, 0, item);
    this.formControl.patchValue([...value]);
  }

  removeItem(index: number) {
    this.formControl.patchValue(
      [...(this.formControl.value || [])].filter((_, idx) => idx !== index),
    );
  }
}
