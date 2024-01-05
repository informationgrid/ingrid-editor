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
import { LiteratureDoctype } from "./ingrid/doctypes/literature.doctype";
import { ProjectDoctype } from "./ingrid/doctypes/project.doctype";
import { DataCollectionDoctype } from "./ingrid/doctypes/data-collection.doctype";
import { InformationSystemDoctype } from "./ingrid/doctypes/information-system.doctype";
import { ConformityDialogComponent } from "./ingrid/dialogs/conformity-dialog.component";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { AsyncPipe, DatePipe, JsonPipe, NgForOf, NgIf } from "@angular/common";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { GetCapabilitiesDialogComponent } from "../app/formly/types/update-get-capabilities/get-capabilities-dialog/get-capabilities-dialog.component";
import { DialogTemplateModule } from "../app/shared/dialog-template/dialog-template.module";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatListModule } from "@angular/material/list";
import { SharedPipesModule } from "../app/directives/shared-pipes.module";
import { ThesaurusReportComponent } from "./ingrid/components/thesaurus-report.component";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { GetCapabilititesWizardPlugin } from "./ingrid/components/getCapWIzard/get-capabilitites-wizard.plugin";
import { FormToolbarService } from "../app/+form/form-shared/toolbar/form-toolbar.service";
import { IsoViewPlugin } from "./ingrid/components/iso-view/iso-view.plugin";
import { IsoViewComponent } from "./ingrid/components/iso-view/iso-view.component";
import { BreadcrumbModule } from "../app/+form/form-info/breadcrumb/breadcrumb.module";
import { InvekosPlugin } from "./ingrid/behaviours/invekos.plugin";
import { GeoDatasetDoctype } from "./ingrid/doctypes/geo-dataset.doctype";

@Component({
  template: "",
})
export class InGridComponent implements OnInit {
  profileService = inject(ProfileService);
  folder = inject(FolderDoctype);
  specialisedTask = inject(SpecialisedTaskDoctype);
  geoDataset = inject(GeoDatasetDoctype);
  literature = inject(LiteratureDoctype);
  geoService = inject(GeoServiceDoctype);
  project = inject(ProjectDoctype);
  dataCollection = inject(DataCollectionDoctype);
  informationSystem = inject(InformationSystemDoctype);
  person = inject(IngridPersonDoctype);
  organisation = inject(IngridOrganisationDoctype);
  getCapWizard = inject(GetCapabilititesWizardPlugin);
  isoView = inject(IsoViewPlugin);
  invekos = inject(InvekosPlugin);

  protected getDocTypes = () => {
    return [
      this.folder,
      this.specialisedTask,
      this.geoDataset,
      this.literature,
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
  }
}

@NgModule({
  declarations: [
    InGridComponent,
    ConformityDialogComponent,
    GetCapabilitiesDialogComponent,
    ThesaurusReportComponent,
  ],
  providers: [GetCapabilititesWizardPlugin, IsoViewPlugin, FormToolbarService],
  imports: [
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    AsyncPipe,
    NgForOf,
    MatDatepickerModule,
    MatCheckboxModule,
    JsonPipe,
    NgIf,
    MatAutocompleteModule,
    DialogTemplateModule,
    MatProgressSpinnerModule,
    MatListModule,
    SharedPipesModule,
    DatePipe,
    MatSnackBarModule,
    IsoViewComponent,
    BreadcrumbModule,
  ],
  exports: [InGridComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridComponent;
  }
}
