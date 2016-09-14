import {RouterModule} from "@angular/router";
import {FieldsComponent} from "./fields.component";

export const routing = RouterModule.forChild([
  {path: 'fields', component: FieldsComponent}
]);