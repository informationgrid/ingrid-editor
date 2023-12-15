/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { ApprovalProcedureDoctype } from "./uvp/doctypes/approval-procedure.doctype";
import { FolderDoctype } from "./folder/folder.doctype";
import { Component, NgModule, Renderer2 } from "@angular/core";
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
import { TranslocoService } from "@ngneat/transloco";
import { TagsService } from "../app/+catalog/+behaviours/system/tags/tags.service";
import { ZabbixReportBehaviour } from "./uvp/behaviours/zabbix-report.behaviour";
import { ActivityReportBehaviour } from "./uvp/behaviours/activity-report.behaviour";

@Component({
  template: "",
})
class UVPComponent {
  constructor(
    private profileService: ProfileService,
    private translocoService: TranslocoService,
    private tagsService: TagsService,
    private renderer: Renderer2,
    reportsService: ReportsService,
    folder: FolderDoctype,
    approvalProcedureDoctype: ApprovalProcedureDoctype,
    spatialPlanningProcedureDoctype: SpatialPlanningProcedureDoctype,
    lineDeterminationDoctype: LineDeterminationDoctype,
    negativeAssessmentDoctype: NegativePreliminaryAssessmentDoctype,
    foreignProjectsDoctype: ForeignProjectsDoctype,
    address: UvpPersonDoctype,
    organisation: UvpOrganisationDoctype,
    private pluginService: PluginService,
    private publishNegativeAssessmentBehaviour: PublishNegativeAssessmentBehaviour,
    private zabbixReportBehaviour: ZabbixReportBehaviour,
    private activityReportBehaviour: ActivityReportBehaviour,
  ) {
    this.addBehaviour(negativeAssessmentDoctype);
    this.tagsService.addAdditionalTags(["negative-assessment-not-publish"]);
    this.addStylesheet();

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

    this.removeExpiredDocumentsTab(reportsService);
  }

  private modifyFormHeader() {
    this.profileService.updateUIProfileStore({
      hideFormHeaderInfos: ["_metadataDate"],
    });
  }

  private addBehaviour(
    negativeAssessmentDoctype: NegativePreliminaryAssessmentDoctype,
  ) {
    const uvpNumberPlugin = new UvpNumberBehaviour();
    this.pluginService.registerPlugin(this.publishNegativeAssessmentBehaviour);
    this.pluginService.registerPlugin(uvpNumberPlugin);
    this.pluginService.registerPlugin(this.zabbixReportBehaviour);
    this.pluginService.registerPlugin(this.activityReportBehaviour);

    if (this.publishNegativeAssessmentBehaviour.isActive) {
      negativeAssessmentDoctype.forPublish = true;
    }
  }

  private addUVPReportTab(reportsService: ReportsService) {
    reportsService.addRoute({
      path: "uvp-bericht",
      loadComponent: () =>
        import("./uvp/reports/uvp-bericht/uvp-bericht.component").then(
          (m) => m.UvpBerichtComponent,
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
      loadComponent: () =>
        import("./uvp/reports/upload-check/upload-check.component").then(
          (m) => m.UploadCheckComponent,
        ),
      data: {
        title: "UVP Upload Check",
        permission: "can_create_uvp_report",
      },
    });
  }

  private removeExpiredDocumentsTab(reportsService: ReportsService) {
    reportsService.removeRoute("expiration");
  }

  private addStylesheet() {
    const style = this.getStyle(this.publishNegativeAssessmentBehaviour);

    const styleElement = this.renderer.createElement("style");
    this.renderer.appendChild(styleElement, document.createTextNode(style));
    this.renderer.appendChild(
      this.renderer.selectRootElement("head", true),
      styleElement,
    );
  }

  private getStyle(behaviour: PublishNegativeAssessmentBehaviour) {
    if (!behaviour.isActive || !behaviour.data.controlledByDataset) {
      // set tag-translation to an empty string to suppress the tooltip, which contains the information of the tag
      // this only can happen if tagging was switch on and off again
      this.translocoService.setTranslationKey(
        "tags.negative-assessment-not-publish",
        " ", // needs an extra space!
      );
      return ".mat-icon + .document-icon-tag { border: none; }";
    } else {
      return `
      .mat-icon + .document-icon-tag.negative-assessment-not-publish {
        background-color: #a1a1a1;
      }`;
    }
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
