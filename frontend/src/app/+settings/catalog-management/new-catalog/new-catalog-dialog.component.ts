/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";
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
  model: CatalogSettings = {};

  constructor(
    public dialogRef: MatDialogRef<NewCatalogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public types: Profile[],
    private catalogService: CatalogService,
  ) {
    this.model.type = types[0].id;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
