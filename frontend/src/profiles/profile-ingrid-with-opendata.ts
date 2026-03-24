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
import { Component, inject, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";
import { OpenDataDoctype } from "./opendata/doctypes/open-data.doctype";
import { OpenDataInitProfile } from "./opendata/open-data-init-profile.service";

@Component({
  template: "",
  standalone: true,
})
class InGridWithOpendataComponent extends InGridComponent {
  openDataDoc = inject(OpenDataDoctype);
  private initOpendata = inject(OpenDataInitProfile);

  protected getDocTypes = () => [
    this.folder,
    this.specialisedTask,
    this.geoDataset,
    this.publication,
    this.geoService,
    this.project,
    this.dataCollection,
    this.informationSystem,
    this.person,
    this.organisation,
    this.openDataDoc,
  ];

  constructor() {
    super();

    this.isoView.defaultExportFormat = (docType: string) =>
      docType === "OpenDataDoc" ? "indexOpenData" : "ingridISO";

    this.isoView.availableExportFormats = (docType: string) =>
      docType === "OpenDataDoc"
        ? ["indexOpenData", "indexOpenDataRDF"]
        : ["ingridISO"];

    this.initOpendata.initProfile();
  }
}

@NgModule({
  imports: [InGridWithOpendataComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridWithOpendataComponent;
  }
}
