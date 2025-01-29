import { Injectable } from "@angular/core";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { UvpArchiveComponent } from "../../profiles/uvp/config/uvp-archive/uvp-archive.component";
import { Route } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class CatalogRoutesService {
  private additionalRoutes: Route[] = [];

  constructor() {}

  addRoute(route: Route) {
    this.additionalRoutes.push(route);
  }

  getAdditionalRoutes(): Route[] {
    return this.additionalRoutes;
  }
}
