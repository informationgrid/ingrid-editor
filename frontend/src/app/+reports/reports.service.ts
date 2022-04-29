import { Injectable } from "@angular/core";
import { Route, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { ReportsComponent } from "./reports/reports.component";
import { GeneralReportComponent } from "./general-report/general-report.component";

interface RouterTab {
  label: string;
  path: string;
  component?: any;
  loadChildren?: any;
}

@Injectable({
  providedIn: "root",
})
export class ReportsService {
  tabs: BehaviorSubject<RouterTab[]>;
  initialTabs = [
    { label: "Statistik", path: "general", component: GeneralReportComponent },
  ];

  initialChildren: Route[] = [
    {
      path: "",
      redirectTo: "general",
      pathMatch: "full",
    },
  ];

  constructor(private router: Router) {
    this.tabs = new BehaviorSubject(this.initialTabs);
  }

  addTab(tab: RouterTab) {
    this.tabs.next([...this.tabs.value, tab]);
  }

  updateRouter() {
    const newChildRoutes = this.tabs.value.map((tab) => {
      return tab.component
        ? {
            path: tab.path,
            component: tab.component,
          }
        : {
            path: tab.path,
            loadChildren: tab.loadChildren,
          };
    });

    this.updateReportRoute([...this.initialChildren, ...newChildRoutes]);
  }

  private updateReportRoute(children: Route[]) {
    const config = this.router.config;
    config[config.findIndex((c) => c.path === "reports")] = {
      path: "reports",
      component: ReportsComponent,
      children: children,
    };
    this.router.resetConfig(config);
  }
}
