import {RouterModule} from "@angular/router";
import {UserComponent} from "./user.component";

export const routing = RouterModule.forChild([
  {path: 'user', component: UserComponent}
]);