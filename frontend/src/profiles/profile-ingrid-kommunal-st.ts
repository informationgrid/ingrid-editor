import { Component, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";

@Component({
  template: "",
})
class InGridKommunalStComponent extends InGridComponent {
  constructor() {
    super();
    this.profileService.registerProfiles([
      this.folder,
      this.geoDataset,
      this.geoService,
    ]);
  }
}

@NgModule({
  declarations: [InGridKommunalStComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridKommunalStComponent;
  }
}
