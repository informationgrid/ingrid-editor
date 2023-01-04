import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { FolderDoctype } from "./folder/folder.doctype";
import { GeoDatasetDoctype } from "./ingrid/doctypes/geo-dataset.doctype";
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
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { AsyncPipe, JsonPipe, NgForOf, NgIf } from "@angular/common";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { FlexModule } from "@angular/flex-layout";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { TableDialogComponent } from "../app/shared/table-dialog/table-dialog.component";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";

@Component({
  template: "",
})
class InGridComponent {
  constructor(
    profileService: ProfileService,
    folder: FolderDoctype,
    specialisedTask: SpecialisedTaskDoctype,
    geoDataset: GeoDatasetDoctype,
    literature: LiteratureDoctype,
    geoService: GeoServiceDoctype,
    project: ProjectDoctype,
    dataCollection: DataCollectionDoctype,
    informationSystem: InformationSystemDoctype,
    person: IngridPersonDoctype,
    organisation: IngridOrganisationDoctype
  ) {
    profileService.registerProfiles([
      folder,
      specialisedTask,
      geoDataset,
      literature,
      geoService,
      project,
      dataCollection,
      informationSystem,
      person,
      organisation,
    ]);

    profileService.setDefaultDataDoctype(geoDataset);
  }
}

@NgModule({
  declarations: [
    InGridComponent,
    ConformityDialogComponent,
    TableDialogComponent,
  ],
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
    FlexModule,
    JsonPipe,
    NgIf,
    MatAutocompleteModule,
  ],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridComponent;
  }
}
