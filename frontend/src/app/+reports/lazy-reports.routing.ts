/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Routes } from "@angular/router";
import { ReportsComponent } from "./reports/reports.component";
import { GeneralReportComponent } from "./general-report/general-report.component";
import { ReportsService } from "./reports.service";
import { UrlCheckComponent } from "./url-check/url-check.component";
import { inject } from "@angular/core";

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
    // Ensure additional report routes are merged before navigation within this lazy scope
    providers: [
      {
        provide: "REPORTS_ROUTE_INITIALIZER",
        useFactory: () => {
          // side-effect only: merge additional routes and apply filter
          const reportService = inject(ReportsService);
          const baseChildren = routes[0].children!;
          // merge additional routes (if any) only once
          reportService.addRoutes(baseChildren);
          const filtered = reportService.filterRoutes(baseChildren);
          // keep reference stable
          routes[0].children!.splice(0, routes[0].children!.length, ...filtered);
          return true;
        },
      },
    ],
  },
];
export default routes;
