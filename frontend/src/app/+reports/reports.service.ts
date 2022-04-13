import { Injectable } from "@angular/core";
import { routing } from "./reports.routing";
import { Router, RouterModule } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { ReportsComponent } from "./reports/reports.component";
import { GeneralReportComponent } from "./general-report/general-report.component";
import { UvpBerichtComponent } from "../../profiles/uvp/reports/uvp-bericht/uvp-bericht.component";

@Injectable({
  providedIn: "root",
})
export class ReportsService {
  tabs: BehaviorSubject<
    { label: string; path: string; component?: any; loadChildren?: any }[]
  >;
  initialTabs = [
    { label: "Statistik", path: "general", component: GeneralReportComponent },
  ];

  constructor(private router: Router) {
    this.tabs = new BehaviorSubject(this.initialTabs);
  }

  addTab(tab: {
    label: string;
    path: string;
    component?: any;
    loadChildren?: any;
  }) {
    this.tabs.value.push(tab);
    this.tabs.next(this.tabs.value);
  }

  updateRouter() {
    const children: any = [
      {
        path: "",
        redirectTo: "general",
        pathMatch: "full",
      },
    ];
    this.tabs.value.forEach((tab) => {
      const newPath = tab.component
        ? {
            path: tab.path,
            component: tab.component,
          }
        : {
            path: tab.path,
            loadChildren: tab.loadChildren,
            // loadChildren: () =>
            //   import("../../profiles/uvp/reports/uvp-reports.module").then(
            //     (m) => m.UvpSharedModule
            //   ),
          };
      children.push(newPath);
      /*
      const reportPathIndex = this.router.config.findIndex(
        (c) => c.path === "reports"
      );
      const reportPath = this.router.config[reportPathIndex];
      const reportChildren = reportPath.children;
      reportChildren.push(newPath);
      reportPath.children = reportChildren;

      const config = this.router.config;
      config[reportPathIndex] = reportPath;
      this.router.resetConfig(config);
      */
    });
    const reportsRoute = {
      path: "reports",
      component: ReportsComponent,
      children: children,
    };

    const config = this.router.config;
    config[config.findIndex((c) => c.path === "reports")] = reportsRoute;
    this.router.resetConfig(config);
  }
}
