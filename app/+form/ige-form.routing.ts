import {RouterModule} from "@angular/router";
import {DynamicFormComponent} from "./dynamic-form.component";
import {AuthGuard} from "../security/auth.guard";

export const routing = RouterModule.forChild([
  {path: 'form', component: DynamicFormComponent, canActivate: [AuthGuard]},
  {path: 'form/:id', component: DynamicFormComponent, canActivate: [AuthGuard]}
]);