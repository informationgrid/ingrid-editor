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
import { GeoDatasetDoctypeBaw } from "./ingrid-baw/doctypes/geo-dataset.doctype";
import { GeoServiceDoctypeBaw } from "./ingrid-baw/doctypes/geo-service.doctype";
import { MatDialog } from "@angular/material/dialog";
import { DocEventsService } from "../app/services/event/doc-events.service";
import { UntilDestroy } from "@ngneat/until-destroy";
import { SoftwareDoctypeBaw } from "./ingrid-baw/doctypes/software.doctype";
import { CommonFieldsBaw } from "./ingrid-baw/doctypes/common-fields";
import { ProjectDoctypeBaw } from "./ingrid-baw/doctypes/project.doctype";
import { PublicationDoctypeBaw } from "./ingrid-baw/doctypes/publication.doctype";

@UntilDestroy()
@Component({
  template: "",
  standalone: true,
})
class InGridBawComponent extends InGridComponent {
  geoDataset = inject(GeoDatasetDoctypeBaw);
  geoService = inject(GeoServiceDoctypeBaw);
  project = inject(ProjectDoctypeBaw);
  publication = inject(PublicationDoctypeBaw);
  software = inject(SoftwareDoctypeBaw);

  dialog = inject(MatDialog);
  docEvents = inject(DocEventsService);
  common = inject(CommonFieldsBaw);

  protected getDocTypes = () => [
    this.folder,
    this.geoDataset,
    this.geoService,
    this.project,
    this.publication,
    this.software,
    this.person,
    this.organisation,
  ];

  constructor() {
    super();
    this.isoView.isoExportFormat = "ingridISOBaw";
    this.modifyFormFieldConfiguration();
  }

  private modifyFormFieldConfiguration() {
    [
      this.geoDataset,
      this.geoService,
      this.project,
      this.publication,
      this.software,
    ].forEach((docType) => {
      // add BWaStr-Strecken to spatial types
      docType.options.spatialTypes.push("bwastr");
    });
  }
}

@NgModule({
  imports: [InGridBawComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridBawComponent;
  }
}
