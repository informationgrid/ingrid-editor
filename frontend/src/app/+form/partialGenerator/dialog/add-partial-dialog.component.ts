import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component( {
  templateUrl: 'add-partial-dialog.component.html',
  styleUrls: ['add-partial-dialog.component.css']
} )
export class AddPartialDialogComponent {

  constructor(public dialogRef: MatDialogRef<AddPartialDialogComponent>,
              @Inject( MAT_DIALOG_DATA ) public types: any) {
  }

}
