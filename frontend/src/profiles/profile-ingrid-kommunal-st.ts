import { Component, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";

@Component({
  template: "",
})
class InGridKommunalStComponent extends InGridComponent {
  constructor() {
    super();

    this.modifyFormFieldConfiguration();
  }

  private modifyFormFieldConfiguration() {
    this.geoService.geoServiceOptions.required.operations = true;
    this.geoService.geoServiceOptions.required.classification = false;

    this.geoDataset.geodatasetOptions.required.statement = false;
    this.geoDataset.geodatasetOptions.required.subType = false;
    this.geoDataset.geodatasetOptions.dynamicRequired.citation = undefined;
    this.geoDataset.geodatasetOptions.required.identifier = false;

    [
      this.specialisedTask,
      this.geoDataset,
      this.literature,
      this.geoService,
      this.project,
      this.dataCollection,
      this.informationSystem,
    ].forEach((docType) => {
      docType.options.required.freeKeywords = true;
      docType.options.required.useLimitation = true;
      docType.options.dynamicRequired.accessConstraints = undefined;
      docType.options.required.accessConstraints = true;
    });
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
