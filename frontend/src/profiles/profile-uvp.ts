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
import { BehaviourService } from "../app/services/behavior/behaviour.service";
import { PublishNegativeAssessmentBehaviour } from "./uvp/behaviours/publish-negative-assessment.behaviour";
import { filter, map, take } from "rxjs/operators";
import { Plugin } from "../app/+catalog/+behaviours/plugin";
import { ReportsService } from "../app/+reports/reports.service";
import { NavigationEnd, Router } from "@angular/router";

@Component({
  template: "dynamic component",
})
class UVPComponent {
  constructor(
    profileService: ProfileService,
    reportsService: ReportsService,
    behaviourService: BehaviourService,
    folder: FolderDoctype,
    approvalProcedureDoctype: ApprovalProcedureDoctype,
    spatialPlanningProcedureDoctype: SpatialPlanningProcedureDoctype,
    lineDeterminationDoctype: LineDeterminationDoctype,
    negativeAssessmentDoctype: NegativePreliminaryAssessmentDoctype,
    foreignProjectsDoctype: ForeignProjectsDoctype,
    address: UvpPersonDoctype,
    organisation: UvpOrganisationDoctype,
    router: Router
  ) {
    this.addBehaviour(behaviourService, negativeAssessmentDoctype);

    this.handleInitialRouteToReport(router);

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

    this.modifyFormHeader(profileService);

    this.addUVPReportTab(reportsService);
  }

  private handleInitialRouteToReport(router: Router) {
    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        take(1)
      )
      .subscribe((event: NavigationEnd) => {
        if (event.url === "/reports/uvp-bericht") {
          setTimeout(() => {
            router.navigate([event.url]);
          });
        }
      });
  }

  private modifyFormHeader(service: ProfileService) {
    service.updateUIProfileStore({
      hideFormHeaderInfos: ["type"],
    });
  }

  private addBehaviour(
    behaviourService: BehaviourService,
    negativeAssessmentDoctype: NegativePreliminaryAssessmentDoctype
  ) {
    const behaviour = new PublishNegativeAssessmentBehaviour();
    behaviourService.addSystemBehaviourFromProfile(behaviour);

    behaviourService.theSystemBehaviours$
      .pipe(
        map((plugins) => this.getActiveState(plugins, behaviour.id)),
        filter((isActive) => isActive)
      )
      .subscribe(() => (negativeAssessmentDoctype.forPublish = true));
  }

  private getActiveState(plugins: Plugin[], behaviourId: string) {
    return plugins.find((plugin) => plugin.id === behaviourId)?.isActive;
  }

  private addUVPReportTab(reportsService: ReportsService) {
    reportsService.addTab({
      label: "UVP Bericht",
      path: "uvp-bericht",
      loadChildren: () =>
        import("./uvp/reports/uvp-reports.module").then(
          (m) => m.UvpReportsModule
        ),
    });
    reportsService.updateRouter();
  }
}

@NgModule({
  declarations: [UVPComponent],
  // imports: [
  //   RouterModule.forRoot([
  //     {
  //       path: "xxx",
  //       loadChildren: () =>
  //         import("./uvp/reports/uvp-reports.module").then((m) => m.UvpSharedModule),
  //       //canActivate: [AuthGuard],
  //       data: {
  //         icon: "Uebersicht",
  //       },
  //     },
  //   ]),
  // ],
})
export class ProfilePack {
  static getMyComponent() {
    return UVPComponent;
  }
}
