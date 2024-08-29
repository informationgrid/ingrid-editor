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

  constructor() {
    super();
    // this.isoView.isoExportFormat = "ingridISOExternalBast";
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
    const openDataActiveNotRequired =
      '!field.form.root.get("isOpenData")?.value';
    [this.geoDataset, this.geoService].forEach((docType) => {
      const options = docType.options;
      options.required.resourceDateType = true;
      options.required.spatialReferences = false;
      options.dynamicRequired.spatialReferences = openDataActiveNotRequired;
      options.required.spatialSystems = false;
      options.dynamicRequired.spatialSystems = openDataActiveNotRequired;
    });
    const geodatasetOptions = this.geoDataset.geodatasetOptions;
    geodatasetOptions.required.identifier = false;
    geodatasetOptions.dynamicRequired.identifier = openDataActiveNotRequired;
    geodatasetOptions.required.statement = false;
    geodatasetOptions.dynamicRequired.statement = openDataActiveNotRequired;

    const dataCollectionOptions = this.dataCollection.options;
    dataCollectionOptions.required.resourceDateType = true;
    dataCollectionOptions.required.spatialReferences = false;
    dataCollectionOptions.required.spatialSystems = false;
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
