import {RouterModule} from "@angular/router";
import {ResearchComponent} from "./research/research.component";

export const routing = RouterModule.forChild([
  {
    path: '',
    component: ResearchComponent
  }
]);
