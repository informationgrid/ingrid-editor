import { RouterModule } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";
import { UserManagementComponent } from "./user-management/user-management.component";
import { DeactivateGuard } from "./deactivate.guard";
import { UserComponent } from "./user/user.component";
import { GroupComponent } from "./group/group.component";
import { TabGuard } from "../shared/tab.guard";

export const routing = RouterModule.forChild([
  {
    path: "",
    component: UserManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin"], permission: "manage_users" },
    children: [
      {
        path: "",
        redirectTo: "user",
      },
      {
        path: "user",
        component: UserComponent,
        canActivate: [TabGuard],
        canDeactivate: [DeactivateGuard],
        data: {
          title: "Nutzer",
          tabIdentifier: "manage",
        },
      },
      {
        path: "group",
        component: GroupComponent,
        canDeactivate: [DeactivateGuard],
        data: {
          title: "Gruppen & Rechte",
        },
      },
    ],
  },
]);
