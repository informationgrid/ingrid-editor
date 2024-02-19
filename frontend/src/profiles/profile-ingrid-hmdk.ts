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
import { InformationSystemDoctypeHMDK } from "./hmdk/doctypes/information-system.doctype";
import { SpecialisedTaskDoctypeHMDK } from "./hmdk/doctypes/specialisedTask.doctype";
import { GeoDatasetDoctypeHMDK } from "./hmdk/doctypes/geo-dataset.doctype";
import { GeoServiceDoctypeHmdk } from "./hmdk/doctypes/geo-service.doctype";
import { ProjectDoctypeHMDK } from "./hmdk/doctypes/project.doctype";
import { DataCollectionDoctypeHMDK } from "./hmdk/doctypes/data-collection.doctype";
import { PublicationDoctypeHMDK } from "./hmdk/doctypes/publication.doctype";

@Component({
  template: "",
})
class InGridHMDKComponent extends InGridComponent {
  specialisedTask = inject(SpecialisedTaskDoctypeHMDK);
  geoDataset = inject(GeoDatasetDoctypeHMDK);
  publication = inject(PublicationDoctypeHMDK);
  geoService = inject(GeoServiceDoctypeHmdk);
  project = inject(ProjectDoctypeHMDK);
  dataCollection = inject(DataCollectionDoctypeHMDK);
  informationSystem = inject(InformationSystemDoctypeHMDK);

  constructor() {
    super();

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
      // show open data for all types.
      docType.options.hide.openData = false;
      // show open data categories for all types.
      docType.options.dynamicHide.openDataCategories = "false";
      docType.options.dynamicRequired.openDataCategories =
        "formState.mainModel?.isOpenData || formState.mainModel?.publicationHmbTG";
    });
  }
}

@NgModule({
  declarations: [InGridHMDKComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridHMDKComponent;
  }
}
