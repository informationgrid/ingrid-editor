import { ReportsComponent } from "./reports/reports.component";
import { RouterModule } from "@angular/router";
import { GeneralReportComponent } from "./general-report/general-report.component";

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
        data: {
          title: "Statistik",
        },
      },
    ],
  },
]);
