import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Component, Inject } from '@angular/core';

@Component( {
  templateUrl: 'add-partial-dialog.component.html'
} )
export class AddPartialDialogComponent {

  constructor(public dialogRef: MatDialogRef<AddPartialDialogComponent>,
              @Inject( MAT_DIALOG_DATA ) public data: any) {
  }

}
