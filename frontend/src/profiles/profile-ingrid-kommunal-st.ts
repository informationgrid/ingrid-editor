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
import { Component, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";

@Component({
  template: "",
  standalone: true,
})
class InGridKommunalStComponent extends InGridComponent {
  constructor() {
    super();

    this.modifyFormFieldConfiguration();
  }

  private modifyFormFieldConfiguration() {
    this.geoService.geoServiceOptions.required.classification = false;

    this.geoDataset.geodatasetOptions.required.statement = false;
    this.geoDataset.geodatasetOptions.required.subType = false;
    this.geoDataset.geodatasetOptions.dynamicRequired.citation = undefined;

    [
      this.specialisedTask,
      this.geoDataset,
      this.publication,
      this.geoService,
      this.project,
      this.dataCollection,
      this.informationSystem,
    ].forEach((docType) => {
      docType.options.required.freeKeywords = true;
      docType.options.required.useLimitation = true;
      docType.options.dynamicRequired.accessConstraints = undefined;
      docType.options.required.accessConstraints = true;
    });
  }
}

@NgModule({
  imports: [InGridKommunalStComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridKommunalStComponent;
  }
}
