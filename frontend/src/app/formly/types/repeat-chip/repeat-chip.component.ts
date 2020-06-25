import {Component} from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';
import {MatDialog} from '@angular/material/dialog';
import {ChipDialogComponent, ChipDialogData} from './chip-dialog/chip-dialog.component';

@Component({
  selector: 'ige-repeat-chip',
  templateUrl: './repeat-chip.component.html',
  styleUrls: ['./repeat-chip.component.scss']
})
export class RepeatChipComponent extends FieldArrayType {
  inputModel = '';


  constructor(private dialog: MatDialog) {
    super();
  }

  openDialog() {
    this.dialog.open(ChipDialogComponent, {
      data: <ChipDialogData>{
        options: this.to.options,
        model: this.model
      }
    }).afterClosed()
      .subscribe(response => {
        console.log(response);
        if (response) {
          this.addValuesFromResponse(response);
          this.removeDeselectedValues(response);
        }
      })
  }

  private addValuesFromResponse(response) {
    response.forEach(item => this.model.indexOf(item) === -1 ? this.add(null, item) : null);
  }

  /**
   * Remove items not coming from dialog
   * @param response
   */
  private removeDeselectedValues(response) {
    let i = 0;
    while (i < this.model.length) {
      if (response.indexOf(this.model[i]) === -1) {
        this.remove(i);
        // do not increment i, since remove operation manipulates model
      } else {
        i++;
      }
    }
  }

  addValues(value: string) {
    value.split(',').forEach(item => this.add(null, item));
    this.inputModel = '';
  }
}
