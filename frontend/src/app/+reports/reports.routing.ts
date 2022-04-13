import { ReportsComponent } from "./reports/reports.component";
import { RouterModule } from "@angular/router";
import { GeneralReportComponent } from "./general-report/general-report.component";
import { UvpBerichtComponent } from "../../profiles/uvp/reports/uvp-bericht/uvp-bericht.component";

export const routing = RouterModule.forChild([
  {
    path: "",
    component: ReportsComponent,
    children: [
      {
        path: "",
        redirectTo: "general",
      },
      {
        path: "general",
        component: GeneralReportComponent,
      },
      // {
      //   path: "uvp_bericht",
      //   component: UvpBerichtComponent,
      // },
    ],
  },
]);
