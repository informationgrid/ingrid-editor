import { Component, OnInit } from "@angular/core";
import { FieldArrayType, FormlyFieldConfig } from "@ngx-formly/core";
import { MatDialog } from "@angular/material/dialog";
import {
  FormDialogComponent,
  FormDialogData,
} from "../table/form-dialog/form-dialog.component";
import { CdkDragDrop } from "@angular/cdk/drag-drop";

interface Item {
  type?: string;
  title?: string;
  icon?: string;
  description?: string;
}

@Component({
  selector: "ige-repeat-detail-list",
  templateUrl: "./repeat-detail-list.component.html",
  styleUrls: ["./repeat-detail-list.component.scss"],
})
export class RepeatDetailListComponent
  extends FieldArrayType
  implements OnInit
{
  private getTypeDeclaration: FormlyFieldConfig = {
    key: "_type",
    type: "select",
    props: {
      appearance: "outline",
      required: true,
      label: "Link-Typ",
      simple: true,
      options: [
        { label: "Externer Link", value: "external" },
        { label: "Interner Link", value: "internal" },
        { label: "Daten-Download", value: "download" },
      ],
    },
  };

  constructor(private dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    if (!this.props.asImage) {
      (<FormlyFieldConfig>this.field.fieldArray).fieldGroup.unshift(
        this.getTypeDeclaration
      );
    }
  }

  addItem() {
    this.openDialog(null);
  }

  editItem(index: number) {
    this.openDialog(index);
  }

  private openDialog(index?: number) {
    this.dialog
      .open(FormDialogComponent, {
        minWidth: "400px",
        restoreFocus: true,
        data: <FormDialogData>{
          fields: [this.field.fieldArray],
          model:
            index === null ? {} : JSON.parse(JSON.stringify(this.model[index])),
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
