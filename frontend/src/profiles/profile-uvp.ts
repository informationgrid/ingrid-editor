import { ApprovalProcedureDoctype } from "./uvp/doctypes/approval-procedure.doctype";
import { FolderDoctype } from "./folder/folder.doctype";
import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { SpatialPlanningProcedureDoctype } from "./uvp/doctypes/spatial-planning-procedure.doctype";
import { NegativePreliminaryAssessmentDoctype } from "./uvp/doctypes/negative-preliminary-assessment.doctype";
import { ForeignProjectsDoctype } from "./uvp/doctypes/foreign-projects.doctype";
import { UvpPersonDoctype } from "./uvp/doctypes/uvp-person.doctype";
import { UvpOrganisationDoctype } from "./uvp/doctypes/uvp-organisation.doctype";
import { LineDeterminationDoctype } from "./uvp/doctypes/line-determination.doctype";
import { PublishNegativeAssessmentBehaviour } from "./uvp/behaviours/publish-negative-assessment.behaviour";
import { ReportsService } from "../app/+reports/reports.service";
import { UvpNumberBehaviour } from "./uvp/behaviours/uvp-number.behaviour";
import { PluginService } from "../app/services/plugin/plugin.service";

@Component({
  template: "",
})
class UVPComponent {
  constructor(
    private profileService: ProfileService,
    reportsService: ReportsService,
    folder: FolderDoctype,
    approvalProcedureDoctype: ApprovalProcedureDoctype,
    spatialPlanningProcedureDoctype: SpatialPlanningProcedureDoctype,
    lineDeterminationDoctype: LineDeterminationDoctype,
    negativeAssessmentDoctype: NegativePreliminaryAssessmentDoctype,
    foreignProjectsDoctype: ForeignProjectsDoctype,
    address: UvpPersonDoctype,
    organisation: UvpOrganisationDoctype,
    private pluginService: PluginService
  ) {
    this.addBehaviour(negativeAssessmentDoctype);

    profileService.registerProfiles([
      folder,
      approvalProcedureDoctype,
      spatialPlanningProcedureDoctype,
      lineDeterminationDoctype,
      negativeAssessmentDoctype,
      foreignProjectsDoctype,
      address,
      organisation,
    ]);

    profileService.setDefaultDataDoctype(approvalProcedureDoctype);
    // this is for addresses later
    //   profileService.setDefautAddressDoctype(organisation);

    this.modifyFormHeader();

    this.addUVPReportTab(reportsService);

    this.addUVPUploadCheckReportTab(reportsService);
  }

  private modifyFormHeader() {
    this.profileService.updateUIProfileStore({
      hideFormHeaderInfos: ["_metadataDate"],
    });
  }

  private addBehaviour(
    negativeAssessmentDoctype: NegativePreliminaryAssessmentDoctype
  ) {
    const publishNegativeAssessmentBehaviour =
      new PublishNegativeAssessmentBehaviour();
    const uvpNumberPlugin = new UvpNumberBehaviour();
    this.pluginService.registerPlugin(publishNegativeAssessmentBehaviour);
    this.pluginService.registerPlugin(uvpNumberPlugin);

    if (publishNegativeAssessmentBehaviour.isActive) {
      negativeAssessmentDoctype.forPublish = true;
    }
  }

  private addUVPReportTab(reportsService: ReportsService) {
    reportsService.addRoute({
      path: "uvp-bericht",
      loadChildren: () =>
        import("./uvp/reports/uvp-reports.module").then(
          (m) => m.UvpReportsModule
        ),
      data: {
        title: "UVP Bericht",
        permission: "can_create_uvp_report",
      },
    });
  }

  private addUVPUploadCheckReportTab(reportsService: ReportsService) {
    reportsService.addRoute({
      path: "uvp-upload-check",
      loadChildren: () =>
        import("./uvp/reports/upload-check.module").then(
          (m) => m.UploadCheckModule
        ),
      data: {
        title: "UVP Upload Check",
        permission: "can_create_uvp_report",
      },
    });
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
