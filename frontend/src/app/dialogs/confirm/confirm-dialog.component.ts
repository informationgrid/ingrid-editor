import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';

@Component( {
  templateUrl: 'confirm-dialog.component.html'
} )
export class ConfirmDialogComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject( MAT_DIALOG_DATA ) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
