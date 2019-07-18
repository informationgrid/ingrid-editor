import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { IgeError } from '../../models/ige-error';

@Component( {
  selector: 'error-dialog',
  templateUrl: 'error-dialog.component.html'
} )
export class ErrorDialogComponent {
  error: IgeError[];

  constructor(@Inject( MAT_DIALOG_DATA ) data: IgeError|IgeError[]) {
    console.log( 'Data:', data );
    if (data instanceof Array) {
      this.error = data;
    } else {
      this.error = [data];
    }
  }

}
