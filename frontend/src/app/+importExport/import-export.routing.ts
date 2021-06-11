import { RouterModule } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";
import { OverviewComponent } from "./overview.component";

export const routing = RouterModule.forChild([
  {
    path: "",
    component: OverviewComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin"] },
  },
]);
