import { ApprovalProcedureDoctype } from "./uvp/approval-procedure.doctype";
import { FolderDoctype } from "./folder/folder.doctype";
import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { SpatialPlanningProcedureDoctype } from "./uvp/spatial-planning-procedure.doctype";
import { NegativePreliminaryAssessmentDoctype } from "./uvp/negative-preliminary-assessment.doctype";
import { ForeignProjectsDoctype } from "./uvp/foreign-projects.doctype";
import { UvpPersonDoctype } from "./uvp/uvp-person.doctype";
import { UvpOrganisationDoctype } from "./uvp/uvp-organisation.doctype";
import { LineDeterminationDoctype } from "./uvp/line-determination.doctype";

@Component({
  template: "dynamic component",
})
class UVPComponent {
  constructor(
    service: ProfileService,
    folder: FolderDoctype,
    approvalProcedureDoctype: ApprovalProcedureDoctype,
    spatialPlanningProcedureDoctype: SpatialPlanningProcedureDoctype,
    lineDeterminationDoctype: LineDeterminationDoctype,
    negativePreliminaryAssessmentDoctype: NegativePreliminaryAssessmentDoctype,
    foreignProjectsDoctype: ForeignProjectsDoctype,
    address: UvpPersonDoctype,
    organisation: UvpOrganisationDoctype
  ) {
    service.registerProfiles([
      folder,
      approvalProcedureDoctype,
      spatialPlanningProcedureDoctype,
      lineDeterminationDoctype,
      negativePreliminaryAssessmentDoctype,
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
