import {Component, OnInit} from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';
import {ChipDialogComponent, ChipDialogData} from '../repeat-chip/chip-dialog/chip-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {FormDialogComponent, FormDialogData} from '../table/form-dialog/form-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {DomSanitizer} from '@angular/platform-browser';

interface Item {
  type?: string;
  title?: string;
  icon?: string;
  description?: string;
}

@Component({
  selector: 'ige-repeat-detail-list',
  templateUrl: './repeat-detail-list.component.html',
  styleUrls: ['./repeat-detail-list.component.scss']
})
export class RepeatDetailListComponent extends FieldArrayType {

  constructor(private dialog: MatDialog, private sanitizer: DomSanitizer) {
    super();
  }

  addItem() {
    this.openDialog(null);
  }

  editItem(index: number) {
    this.openDialog(index);
  }

  private openDialog(index?: number) {
    this.dialog.open(FormDialogComponent, {
      minWidth: '400px',
      data: <FormDialogData>{
        fields: [this.field.fieldArray],
        model: index === null ? {} : JSON.parse(JSON.stringify(this.model[index]))
      }
    }).afterClosed()
      .subscribe(response => {
        console.log(response);
        if (response) {
          if (index !== null) {
            this.remove(index);
          }
          this.add(index, response);
        }
      })
  }

}
