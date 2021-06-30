import { RouterModule } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";
import { UserManagementComponent } from "./user-management/user-management.component";
import { DeactivateGuard } from "./deactivate.guard";

export const routing = RouterModule.forChild([
  {
    path: "",
    component: UserManagementComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    data: { roles: ["admin"] },
  },
]);
