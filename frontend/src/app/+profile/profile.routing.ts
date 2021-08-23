import { ProfileComponent } from "./profile/profile.component";
import { RouterModule } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";

export const routing = RouterModule.forChild([
  {
    path: "",
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
]);
