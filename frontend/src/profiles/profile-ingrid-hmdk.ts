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
import { InformationSystemDoctypeHMDK } from "./ingrid-hmdk/doctypes/information-system.doctype";
import { SpecialisedTaskDoctypeHMDK } from "./ingrid-hmdk/doctypes/specialisedTask.doctype";
import { GeoDatasetDoctypeHMDK } from "./ingrid-hmdk/doctypes/geo-dataset.doctype";
import { GeoServiceDoctypeHmdk } from "./ingrid-hmdk/doctypes/geo-service.doctype";
import { ProjectDoctypeHMDK } from "./ingrid-hmdk/doctypes/project.doctype";
import { DataCollectionDoctypeHMDK } from "./ingrid-hmdk/doctypes/data-collection.doctype";
import { PublicationDoctypeHMDK } from "./ingrid-hmdk/doctypes/publication.doctype";
import { MatDialog } from "@angular/material/dialog";
import { DocEventsService } from "../app/services/event/doc-events.service";
import { TreeQuery } from "../app/store/tree/tree.query";
import { UntilDestroy } from "@ngneat/until-destroy";
import { PluginService } from "../app/services/plugin/plugin.service";
import { ModifyPublishedBehaviour } from "./ingrid-hmdk/behaviours/modify-published.behaviour";

@UntilDestroy()
@Component({
  template: "",
  standalone: true,
})
class InGridHMDKComponent extends InGridComponent {
  specialisedTask = inject(SpecialisedTaskDoctypeHMDK);
  geoDataset = inject(GeoDatasetDoctypeHMDK);
  publication = inject(PublicationDoctypeHMDK);
  geoService = inject(GeoServiceDoctypeHmdk);
  project = inject(ProjectDoctypeHMDK);
  dataCollection = inject(DataCollectionDoctypeHMDK);
  informationSystem = inject(InformationSystemDoctypeHMDK);
  modifyPublishedBehaviour = inject(ModifyPublishedBehaviour);

  dialog = inject(MatDialog);
  docEvents = inject(DocEventsService);
  treeQuery = inject(TreeQuery);
  pluginService = inject(PluginService);

  constructor() {
    super();
    this.isoView.isoExportFormat = "ingridISOHmdk";
    this.modifyFormFieldConfiguration();
    this.pluginService.registerPlugin(this.modifyPublishedBehaviour);
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
      // show open data categories for all types. except specialisedTask ("Organisationseinheit")
      if (docType === this.specialisedTask) {
        docType.options.dynamicHide.openDataCategories = "true";
        docType.options.dynamicRequired.openDataCategories = "false";
      } else {
        docType.options.dynamicHide.openDataCategories = undefined;
        docType.options.dynamicRequired.openDataCategories =
          "formState.mainModel?.isOpenData || formState.mainModel?.publicationHmbTG";
      }
    });
  }
}

@NgModule({
  imports: [InGridHMDKComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridHMDKComponent;
  }
}
