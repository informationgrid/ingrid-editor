import { Injectable } from "@angular/core";
import { Route, Routes } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class ReportsService {
  additionalRoutes: Route[] = [];
  filter = undefined;

  constructor() {}

  addRoute(route: Route) {
    this.additionalRoutes.push(route);
  }

  addRoutes(routes: Routes) {
    routes.push(...this.additionalRoutes);
  }

  setFilter(filter) {
    this.filter = filter;
  }

  filterRoutes(routes: Routes) {
    return this.filter ? routes.filter(this.filter) : routes;
  }
}
