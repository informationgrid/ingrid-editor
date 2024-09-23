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
import { Component, inject, NgModule, OnInit } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { FolderDoctype } from "./folder/folder.doctype";
import { IngridPersonDoctype } from "./ingrid/doctypes/ingrid-person.doctype";
import { IngridOrganisationDoctype } from "./ingrid/doctypes/ingrid-organisation.doctype";
import { GeoServiceDoctype } from "./ingrid/doctypes/geo-service.doctype";
import { SpecialisedTaskDoctype } from "./ingrid/doctypes/specialisedTask.doctype";
import { PublicationDoctype } from "./ingrid/doctypes/publication-doctype.service";
import { ProjectDoctype } from "./ingrid/doctypes/project.doctype";
import { DataCollectionDoctype } from "./ingrid/doctypes/data-collection.doctype";
import { InformationSystemDoctype } from "./ingrid/doctypes/information-system.doctype";
import { MatDialog } from "@angular/material/dialog";
import { GetCapabilititesWizardPlugin } from "./ingrid/components/getCapWIzard/get-capabilitites-wizard.plugin";
import { IsoViewPlugin } from "./ingrid/components/iso-view/iso-view.plugin";

import { InvekosPlugin } from "./ingrid/behaviours/invekos.plugin";
import { GeoDatasetDoctype } from "./ingrid/doctypes/geo-dataset.doctype";
import { firstValueFrom } from "rxjs";
import { PublicationCheckDialogComponent } from "./ingrid/dialogs/publication-check/publication-check-dialog.component";
import { Metadata } from "../app/models/ige-document";
import { ConsolidateKeywordsPlugin } from "./ingrid/dialogs/consolidateKeywords/consolidate-keywords.plugin";

export enum InGridDoctype {
  InGridSpecialisedTask = "InGridSpecialisedTask",
  InGridGeoDataset = "InGridGeoDataset",
  InGridPublication = "InGridPublication",
  InGridGeoService = "InGridGeoService",
  InGridProject = "InGridProject",
  InGridDataCollection = "InGridDataCollection",
  InGridInformationSystem = "InGridInformationSystem",
}

@Component({
  template: "",
  standalone: true,
})
export class InGridComponent implements OnInit {
  profileService = inject(ProfileService);
  folder = inject(FolderDoctype);
  specialisedTask = inject(SpecialisedTaskDoctype);
  geoDataset = inject(GeoDatasetDoctype);
  publication = inject(PublicationDoctype);
  geoService = inject(GeoServiceDoctype);
  project = inject(ProjectDoctype);
  dataCollection = inject(DataCollectionDoctype);
  informationSystem = inject(InformationSystemDoctype);
  person = inject(IngridPersonDoctype);
  organisation = inject(IngridOrganisationDoctype);
  // will be created and registered automatically, but needs to be injected!
  // noinspection JSUnusedGlobalSymbols
  getCapWizard = inject(GetCapabilititesWizardPlugin);
  isoView = inject(IsoViewPlugin);
  invekos = inject(InvekosPlugin);
  dialog = inject(MatDialog);
  consolidateKeywords = inject(ConsolidateKeywordsPlugin);
  // docTypesEnum: InGridDoctype

  protected getDocTypes = () => {
    return [
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
    ];
  };

  constructor() {}

  ngOnInit() {
    this.profileService.registerProfiles(this.getDocTypes());

    this.profileService.setDefaultDataDoctype(this.geoDataset);

    this.profileService.additionalPublicationCheck =
      this.getAdditionalPublicationCheck();
  }

  private getAdditionalPublicationCheck() {
    return (data: any, metadata: Metadata, isAddress: boolean) => {
      // ignore check for addresses and specialized-tasks (which does not contain format-field
      const ignoredDocType =
        metadata.docType === InGridDoctype.InGridSpecialisedTask;
      const hasAtLeastOneFormat =
        data.distribution?.format && data.distribution.format.length > 0;

      if (isAddress || ignoredDocType || hasAtLeastOneFormat)
        return Promise.resolve(true);

      return firstValueFrom(
        this.dialog.open(PublicationCheckDialogComponent).afterClosed(),
      );
    };
  }
}

@NgModule({
  imports: [InGridComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridComponent;
  }
}
