import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { FolderDoctype } from "./folder/folder.doctype";
import { PersonDoctype } from "./address/person.doctype";
import { OrganisationDoctype } from "./address/organisation.doctype";
import { GeoDatasetDoctype } from "./ingrid/doctypes/geo-dataset.doctype";
import { IngridPersonDoctype } from "./ingrid/doctypes/ingrid-person.doctype";
import { IngridOrganisationDoctype } from "./ingrid/doctypes/ingrid-organisation.doctype";

@Component({
  template: "",
})
class InGridComponent {
  constructor(
    profileService: ProfileService,
    folder: FolderDoctype,
    geoDataset: GeoDatasetDoctype,
    person: IngridPersonDoctype,
    organisation: IngridOrganisationDoctype
  ) {
    profileService.registerProfiles([folder, geoDataset, person, organisation]);

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
