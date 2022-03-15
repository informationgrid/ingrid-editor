import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, ElementRef, Inject, ViewChild } from "@angular/core";
import {
  CatalogService,
  Profile,
} from "../../../+catalog/services/catalog.service";

export interface CatalogSettings {
  name?: string;
  type?: string;
}

@Component({
  templateUrl: "new-catalog-dialog.component.html",
})
export class NewCatalogDialogComponent {
  @ViewChild("contextNewCatalogContainer") container: ElementRef;
  model: CatalogSettings = {};

  constructor(
    public dialogRef: MatDialogRef<NewCatalogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public types: Profile[],
    private catalogService: CatalogService
  ) {
    this.model.type = types[0].id;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
