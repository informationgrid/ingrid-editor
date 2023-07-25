import { Component, OnInit } from "@angular/core";
import {
  FieldArrayType,
  FormlyFieldConfig,
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
import { AsyncPipe, KeyValuePipe, NgForOf, NgIf } from "@angular/common";
import { SharedPipesModule } from "../../../directives/shared-pipes.module";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { AddButtonModule } from "../../../shared/add-button/add-button.module";
import { MatButtonModule } from "@angular/material/button";
import { FormErrorComponent } from "../../../+form/form-shared/ige-form-error/form-error.component";
import { MatTooltipModule } from "@angular/material/tooltip";

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
  ],
  standalone: true,
})
export class RepeatDetailListComponent
  extends FieldArrayType
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
        restoreFocus: true,
        data: <FormDialogData>{
          fields: [this.field.fieldArray],
          model:
            index === null ? {} : JSON.parse(JSON.stringify(this.model[index])),
          formState: { mainModel: { _type: this.formState.mainModel?._type } },
        },
      })
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          if (index !== null) {
            this.remove(index);
          }
          this.add(index, response);
        }
      });
  }

  drop(event: CdkDragDrop<FormlyFieldConfig>) {
    const item = this.model[event.previousIndex];
    this.remove(event.previousIndex);
    this.add(event.currentIndex, item);
  }
}
