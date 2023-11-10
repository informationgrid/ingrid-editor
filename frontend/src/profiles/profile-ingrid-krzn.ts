import { Component, inject, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";
import { GeoDatasetDoctypeKrzn } from "./krzn/doctypes/geo-dataset.doctype";
import { InformationSystemDoctypeKrzn } from "./krzn/doctypes/information-system.doctype";

@Component({
  template: "",
})
class InGridKrznComponent extends InGridComponent {
  geoDatasetKrzn = inject(GeoDatasetDoctypeKrzn);
  informationSystemKrzn = inject(InformationSystemDoctypeKrzn);

  protected docTypes = [
    this.folder,
    this.specialisedTask,
    this.geoDatasetKrzn,
    this.literature,
    this.geoService,
    this.project,
    this.dataCollection,
    this.informationSystemKrzn,
    this.person,
    this.organisation,
  ];

  constructor() {
    super();

    this.modifyFormFieldConfiguration();
  }

  private modifyFormFieldConfiguration() {
    [
      this.specialisedTask,
      this.geoDatasetKrzn,
      this.literature,
      this.geoService,
      this.project,
      this.dataCollection,
      this.informationSystemKrzn,
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
