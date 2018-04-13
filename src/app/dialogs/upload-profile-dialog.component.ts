import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Component, Inject } from '@angular/core';

@Component( {
  templateUrl: 'new-catalog-dialog.component.html'
} )
export class UploadProfileDialogComponent {

  constructor(public dialogRef: MatDialogRef<UploadProfileDialogComponent>,
              @Inject( MAT_DIALOG_DATA ) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
