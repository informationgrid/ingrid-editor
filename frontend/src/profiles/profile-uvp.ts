import { AdmissionProcedureDoctype } from "./uvp/admission-procedure.doctype";
import { FolderDoctype } from "./folder/folder.doctype";
import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { SpatialPlanningProcedureDoctype } from "./uvp/spatial-planning-procedure.doctype";
import { NegativePreliminaryExaminationDoctype } from "./uvp/negative-preliminary-examination.doctype";
import { ForeignProjectsDoctype } from "./uvp/foreign-projects.doctype";
import { UvpAddressDoctype } from "./uvp/uvp-address.doctype";
import { UvpOrganisationDoctype } from "./uvp/uvp-organisation.doctype";

@Component({
  template: "dynamic component",
})
class UVPComponent {
  constructor(
    service: ProfileService,
    folder: FolderDoctype,
    admissionProcedureDoctype: AdmissionProcedureDoctype,
    spatialPlanningProcedureDoctype: SpatialPlanningProcedureDoctype,
    negativePreliminaryExaminationDoctype: NegativePreliminaryExaminationDoctype,
    foreignProjectsDoctype: ForeignProjectsDoctype,
    address: UvpAddressDoctype,
    organisation: UvpOrganisationDoctype
  ) {
    service.registerProfiles([
      folder,
      admissionProcedureDoctype,
      spatialPlanningProcedureDoctype,
      negativePreliminaryExaminationDoctype,
      foreignProjectsDoctype,
      address,
      organisation,
    ]);
  }
}

@NgModule({
  declarations: [UVPComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return UVPComponent;
  }
}
