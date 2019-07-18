import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';

@Component( {
  templateUrl: 'print-view-dialog.component.html'
} )
export class PrintViewDialogComponent {

  profile: any;

  constructor(public dialogRef: MatDialogRef<PrintViewDialogComponent>,
              @Inject( MAT_DIALOG_DATA ) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
