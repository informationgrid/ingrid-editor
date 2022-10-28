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
  declarations: [InGridComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridComponent;
  }
}
