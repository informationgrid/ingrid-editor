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
import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";
import { GeoDatasetDoctypeBaw } from "./ingrid-baw/doctypes/geo-dataset.doctype";
import { GeoServiceDoctypeBaw } from "./ingrid-baw/doctypes/geo-service.doctype";
import { MatDialog } from "@angular/material/dialog";
import { DocEventsService } from "../app/services/event/doc-events.service";
import { SoftwareDoctypeBaw } from "./ingrid-baw/doctypes/software.doctype";
import { CommonFieldsBaw } from "./ingrid-baw/doctypes/common-fields";
import { ProjectDoctypeBaw } from "./ingrid-baw/doctypes/project.doctype";
import { PublicationDoctypeBaw } from "./ingrid-baw/doctypes/publication.doctype";
import { SimulationDoctypeBaw } from "./ingrid-baw/doctypes/simulation.doctype";
import { MeasurementDoctypeBaw } from "./ingrid-baw/doctypes/measurement.doctype";
import { PublicationAddressDoctype } from "./ingrid-baw/doctypes/publicationAddress.doctype";
import { LaboratoryDataDoctypeBaw } from "./ingrid-baw/doctypes/laboratoryData.doctype";
import { DeleteReferenceHandlerService } from "../app/+catalog/+behaviours/system/DeleteReferenceHandler/delete-reference-handler.service";
import { DocumentAbstract } from "../app/store/document/document.model";
import { TreeNode } from "../app/store/tree/tree-node.model";
import { ConfigService } from "../app/services/config/config.service";
import {
  applyCatalogAccent,
  getCatalogAccent,
} from "../app/services/config/catalog-theme";

@Component({
  template: "",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
class InGridBawComponent extends InGridComponent {
  geoDataset = inject(GeoDatasetDoctypeBaw);
  geoService = inject(GeoServiceDoctypeBaw);
  project = inject(ProjectDoctypeBaw);
  publication = inject(PublicationDoctypeBaw);
  software = inject(SoftwareDoctypeBaw);
  simulation = inject(SimulationDoctypeBaw);
  measurement = inject(MeasurementDoctypeBaw);
  laboratoryData = inject(LaboratoryDataDoctypeBaw);

  publicationAddress = inject(PublicationAddressDoctype);

  dialog = inject(MatDialog);
  docEvents = inject(DocEventsService);
  common = inject(CommonFieldsBaw);
  deleteReferenceHandlerService = inject(DeleteReferenceHandlerService);
  configService = inject(ConfigService);

  protected getDocTypes = () => [
    this.folder,
    this.geoDataset,
    this.geoService,
    this.project,
    this.publication,
    this.software,
    this.simulation,
    this.measurement,
    // TODO: Re-enable when laboratory data implementation is finalized.
    // this.laboratoryData,
    this.person,
    this.organisation,
    this.publicationAddress,
  ];

  constructor() {
    super();
    this.isoView.defaultExportFormat = () => "ingridISOBaw";
    this.modifyFormFieldConfiguration();
    this.deleteReferenceHandlerService.registerAdditionalDisabledCondition(
      this.disableConditionReplaceAddress,
    );
    this.applyCatalogTheme();
  }

  /**
   * Color-codes the editor for the current catalog, so installations with
   * multiple BAW catalogs can tell them apart (see catalog-theme.ts).
   */
  private applyCatalogTheme() {
    applyCatalogAccent(
      getCatalogAccent(
        this.configService.getConfiguration(),
        ConfigService.catalogId,
      ),
    );
  }

  private modifyFormFieldConfiguration() {
    [
      this.geoDataset,
      this.geoService,
      this.project,
      this.publication,
      this.software,
      this.simulation,
      this.measurement,
      this.laboratoryData,
    ].forEach((docType) => {
      // add BWaStr-Strecken to spatial types
      docType.options.spatialTypes.push("bwastr");
      docType.options.optional.doi = true;
      docType.options.optional.additionalInformationSection = true;
    });
  }

  private disableConditionReplaceAddress = (
    source: DocumentAbstract,
    node: TreeNode,
  ) => {
    // Addresses of type Publication (Literature) can not replace addresses of other types
    return (
      source._type !== "PublicationAddressDoc" &&
      node.type === "PublicationAddressDoc"
    );
  };
}

export class ProfilePack {
  static getMyComponent() {
    return InGridBawComponent;
  }
}
