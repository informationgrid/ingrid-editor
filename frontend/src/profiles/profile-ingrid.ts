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
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { AsyncPipe, JsonPipe, NgForOf, NgIf } from "@angular/common";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { FlexModule } from "@angular/flex-layout";
import { MatSelectModule } from "@angular/material/select";
import { TableDialogComponent } from "../app/shared/table-dialog/table-dialog.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { GetCapabilitiesDialogComponent } from "./ingrid/plugins/get-capabilities-dialog/get-capabilities-dialog.component";
import { DialogTemplateModule } from "../app/shared/dialog-template/dialog-template.module";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatListModule } from "@angular/material/list";

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
    profileService.setProfileId("ingrid");
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
    GetCapabilitiesDialogComponent,
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
    DialogTemplateModule,
    MatProgressSpinnerModule,
    MatListModule,
  ],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridComponent;
  }
}
