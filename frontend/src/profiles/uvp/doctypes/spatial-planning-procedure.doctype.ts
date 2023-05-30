import { Injectable } from "@angular/core";
import { LineAndSpatialShared } from "./line-and-spatial-shared";

@Injectable({
  providedIn: "root",
})
export class SpatialPlanningProcedureDoctype extends LineAndSpatialShared {
  id = "UvpSpatialPlanningProcedureDoc";

  label = "Raumordnungsverfahren";

  iconClass = "raumordnungsverfahren";
}
