import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { IgeError } from '../../models/ige-error';

@Component( {
  selector: 'error-dialog',
  templateUrl: 'error-dialog.component.html',
  styleUrls: ['error-dialog.component.scss']
} )
export class ErrorDialogComponent {
  errors: IgeError[];

  constructor(@Inject( MAT_DIALOG_DATA ) data: IgeError|IgeError[], private dlgRef: MatDialogRef<ErrorDialogComponent>) {
    console.log( 'Data:', data );
    if (data instanceof Array) {
      this.errors = data;
    } else {
      this.errors = [data];
    }
  }

  close() {
    this.dlgRef.close();
  }

}
