import {RouterModule} from "@angular/router";
import {DynamicFormComponent} from "./dynamic-form.component";

export const routing = RouterModule.forChild([
  {path: 'form', component: DynamicFormComponent},
  {path: 'form/:id', component: DynamicFormComponent}
]);