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
import { GeoDatasetDoctypeKrzn } from "./krzn/doctypes/geo-dataset.doctype";

@Component({
  template: "",
  standalone: true,
})
class InGridKrznComponent extends InGridComponent {
  geoDataset = inject(GeoDatasetDoctypeKrzn);

  constructor() {
    super();

    this.isoView.isoExportFormat = "ingridISOKrzn";
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
      docType.options.dynamicRequired.accessConstraints = undefined;
      docType.options.required.accessConstraints = true;
    });
  }
}

@NgModule({
  imports: [InGridKrznComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridKrznComponent;
  }
}
