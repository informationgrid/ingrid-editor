import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { SampleDoctype } from "./sample/sample.doctype";
import { FolderDoctype } from "./folder/folder.doctype";
import { SampleOrganisationDoctype } from "./sample/sample-organisation.doctype";

@Component({
  template: "",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class SampleProfileComponent {
  private document = inject(SampleDoctype);
  private folder = inject(FolderDoctype);
  private organisation = inject(SampleOrganisationDoctype);

  constructor(profileService: ProfileService) {
    profileService.registerDoctypes([
      this.document,
      this.folder,
      this.organisation,
    ]);
  }
}

export class ProfilePack {
  static getMyComponent() {
    return SampleProfileComponent;
  }
}
