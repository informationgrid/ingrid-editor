import { Component, inject, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";
import { GeoDatasetDoctypeKrzn } from "./krzn/doctypes/geo-dataset.doctype";
import { InformationSystemDoctypeKrzn } from "./krzn/doctypes/information-system.doctype";
import {
  DataCollectionDoctypeKrzn,
  GeoServiceDoctypeKrzn,
  LiteratureDoctypeKrzn,
  ProjectDoctypeKrzn,
  SpecialisedTaskDoctypeKrzn,
} from "./krzn/doctypes/default.doctypes";

@Component({
  template: "",
})
class InGridKrznComponent extends InGridComponent {
  specialisedTaskKrzn = inject(SpecialisedTaskDoctypeKrzn);
  geoDatasetKrzn = inject(GeoDatasetDoctypeKrzn);
  literatureKrzn = inject(LiteratureDoctypeKrzn);
  geoServiceKrzn = inject(GeoServiceDoctypeKrzn);
  projectKrzn = inject(ProjectDoctypeKrzn);
  dataCollectionKrzn = inject(DataCollectionDoctypeKrzn);
  informationSystemKrzn = inject(InformationSystemDoctypeKrzn);

  protected docTypes = [
    this.folder,
    this.specialisedTaskKrzn,
    this.geoDatasetKrzn,
    this.literatureKrzn,
    this.geoServiceKrzn,
    this.projectKrzn,
    this.dataCollectionKrzn,
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
      this.specialisedTaskKrzn,
      this.geoDatasetKrzn,
      this.literatureKrzn,
      this.geoServiceKrzn,
      this.projectKrzn,
      this.dataCollectionKrzn,
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
