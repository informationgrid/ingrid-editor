import { Component, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";

@Component({
  template: "",
})
class InGridKrznComponent extends InGridComponent {
  constructor() {
    super();

    this.modifyFormFieldConfiguration();
  }

  private modifyFormFieldConfiguration() {
    [
      this.specialisedTask,
      this.geoDataset,
      this.literature,
      this.geoService,
      this.project,
      this.dataCollection,
      this.informationSystem,
    ].forEach((docType) => {
      docType.options.dynamicRequired.accessConstraints = undefined;
      docType.options.required.accessConstraints = true;
    });
  }
}

@NgModule({
  declarations: [InGridKrznComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridKrznComponent;
  }
}
