import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';

export interface CatalogSettings {
  name?: string;
  type?: string;
}

@Component( {
  templateUrl: 'new-catalog-dialog.component.html'
} )
export class NewCatalogDialogComponent {
  types = [{
    id: 'mcloud',
    label: 'mCLOUD Katalog'
  }];
  model: CatalogSettings = {};

  constructor(public dialogRef: MatDialogRef<NewCatalogDialogComponent>,
              @Inject( MAT_DIALOG_DATA ) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
