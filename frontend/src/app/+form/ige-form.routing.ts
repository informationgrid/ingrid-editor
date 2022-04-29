import { Routes } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";
import { FormChangeDeactivateGuard } from "../security/form-change.guard";
import { FormComponent } from "./form/form.component";
import { RedirectFormGuard } from "./redirect-form.guard";

export const routing: Routes = [
  {
    path: "",
    component: FormComponent,
    canActivate: [RedirectFormGuard, AuthGuard /*, NoCatalogAssignedGuard*/],
    data: { roles: ["author", "admin"] },
    canDeactivate: [FormChangeDeactivateGuard],
  },
];
