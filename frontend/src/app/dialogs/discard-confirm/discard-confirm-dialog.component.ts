import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Component, Inject } from '@angular/core';

@Component( {
  templateUrl: 'discard-confirm-dialog.component.html'
} )
export class DiscardConfirmDialogComponent {

  constructor(public dialogRef: MatDialogRef<DiscardConfirmDialogComponent>,
              @Inject( MAT_DIALOG_DATA ) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
