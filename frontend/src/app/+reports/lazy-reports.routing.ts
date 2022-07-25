import { RouterModule, ROUTES, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { ReportsComponent } from "./reports/reports.component";
import { GeneralReportComponent } from "./general-report/general-report.component";
import { ReportsService } from "./reports.service";
import { UrlCheckComponent } from "./url-check/url-check.component";

const routes: Routes = [
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
      {
        path: "url-check",
        component: UrlCheckComponent,
        data: {
          title: "URL-Pflege",
        },
      },
    ],
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
  providers: [
    {
      provide: ROUTES,
      multi: true,
      useFactory: (reportService: ReportsService) => {
        reportService.addRoutes(routes[0].children);
        return routes;
      },
      deps: [ReportsService],
    },
  ],
})
export class LazyReportsRouting {}
