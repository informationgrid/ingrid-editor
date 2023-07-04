import { Injectable } from "@angular/core";
import { LineAndSpatialShared } from "./line-and-spatial-shared";

@Injectable({
  providedIn: "root",
})
export class LineDeterminationDoctype extends LineAndSpatialShared {
  id = "UvpLineDeterminationDoc";

  label = "Linienbestimmung";

  iconClass = "linienbestimmungsverfahren";
}
