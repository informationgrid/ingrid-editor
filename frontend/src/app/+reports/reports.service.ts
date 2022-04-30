import { Injectable } from "@angular/core";
import { Route, Routes } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class ReportsService {
  additionalRoutes: Route[] = [];

  constructor() {}

  addRoute(route: Route) {
    this.additionalRoutes.push(route);
  }

  addRoutes(routes: Routes) {
    routes.push(...this.additionalRoutes);
  }
}
