import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';
import {CatalogService} from '../../../+catalog/services/catalog.service';

export interface CatalogSettings {
  name?: string;
  type?: string;
}

@Component({
  templateUrl: 'new-catalog-dialog.component.html'
})
export class NewCatalogDialogComponent {
  types = this.catalogService.getCatalogProfiles();
  model: CatalogSettings = {};

  constructor(public dialogRef: MatDialogRef<NewCatalogDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private catalogService: CatalogService) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
