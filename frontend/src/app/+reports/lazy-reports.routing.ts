/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
        pathMatch: "full",
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
        routes[0].children = reportService.filterRoutes(routes[0].children);
        return routes;
      },
      deps: [ReportsService],
    },
  ],
})
export class LazyReportsRouting {}
