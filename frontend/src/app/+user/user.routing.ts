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
    data: { roles: ["admin"], permission: "manage_users" },
    /*children: [
      {
        path: "",
        redirectTo: "user",
      },
      {
        path: "codelists",
        component: CatalogCodelistsComponent,
      },
      {
        path: "form-behaviours",
        component: BehavioursComponent,
      },
      ]*/
  },
]);
