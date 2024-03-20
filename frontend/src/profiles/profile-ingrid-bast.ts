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
import { Component, inject, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";
import { GeoDatasetDoctypeBast } from "./ingrid-bast/doctypes/geo-dataset.doctype";
import { GeoServiceDoctypeBast } from "./ingrid-bast/doctypes/geo-service.doctype";
import { CodelistQuery } from "../app/store/codelist/codelist.query";
import { DataCollectionDoctypeBast } from "./ingrid-bast/doctypes/data-collection.doctype";

@Component({
  template: "",
})
class InGridBastComponent extends InGridComponent {
  geoDataset = inject(GeoDatasetDoctypeBast);
  geoService = inject(GeoServiceDoctypeBast);
  dataCollection = inject(DataCollectionDoctypeBast);
  codelistQuery = inject(CodelistQuery);

  // codelistStore = inject(CodelistStore);

  constructor() {
    super();

    this.isoView.isoExportFormat = "ingridISOBast";
    this.modifyFormFieldConfiguration();
  }

  protected getDocTypes = () => [
    this.folder,
    this.geoDataset,
    this.geoService,
    this.dataCollection,
    this.person,
    this.organisation,
  ];

  private modifyFormFieldConfiguration() {
    [this.geoDataset, this.geoService].forEach((docType) => {
      docType.options.required.resourceDateType = true;
    });
  }
}

@NgModule({
  declarations: [InGridBastComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridBastComponent;
  }
}
