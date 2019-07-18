import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';

@Component( {
  templateUrl: 'new-catalog-dialog.component.html'
} )
export class NewCatalogDialogComponent {

  constructor(public dialogRef: MatDialogRef<NewCatalogDialogComponent>,
              @Inject( MAT_DIALOG_DATA ) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
