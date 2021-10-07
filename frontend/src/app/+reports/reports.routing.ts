import { ReportsComponent } from "./reports/reports.component";
import { RouterModule } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";

export const routing = RouterModule.forChild([
  {
    path: "",
    component: ReportsComponent,
    canActivate: [AuthGuard],
  },
]);
