/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { Component, inject } from "@angular/core";
import { GeoDatasetDoctypeKrzn } from "./ingrid-krzn/doctypes/geo-dataset.doctype";
import { InGridWithOpendataComponent } from "./profile-ingrid-with-opendata";

@Component({
  template: "",
  standalone: true,
})
class InGridKrznComponent extends InGridWithOpendataComponent {
  geoDataset = inject(GeoDatasetDoctypeKrzn);

  constructor() {
    super();

    this.isoView.defaultExportFormat = (docType: string) =>
      docType === "OpenDataDoc" ? "indexOpenData" : "ingridISOKrzn";

    this.isoView.availableExportFormats = (docType: string) =>
      docType === "OpenDataDoc"
        ? ["indexOpenData", "indexOpenDataRDF"]
        : ["ingridISOKrzn"];

    this.modifyFormFieldConfiguration();
  }

  private modifyFormFieldConfiguration() {
    [
      this.specialisedTask,
      this.geoDataset,
      this.publication,
      this.geoService,
      this.project,
      this.dataCollection,
      this.informationSystem,
    ].forEach((docType) => {
      docType.options.dynamicRequired.accessConstraints = () => true;
      if (docType === this.informationSystem) {
        docType.options.required.useConstraints = true;
      }
    });
  }
}

export class ProfilePack {
  static getMyComponent() {
    return InGridKrznComponent;
  }
}
