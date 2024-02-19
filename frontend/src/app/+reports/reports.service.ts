/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Injectable } from "@angular/core";
import { Route, Routes } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";

@Injectable({
  providedIn: "root",
})
export class ReportsService {
  additionalRoutes: Route[] = [];
  filter = undefined;

  constructor() {}

  addRoute(route: Route) {
    // add auth guard to route if permission is set and no canActivate is set
    if (route.data?.permission && !route.canActivate) {
      route.canActivate = [AuthGuard];
    }

    this.additionalRoutes.push(route);
  }

  removeRoute(path: string) {
    this.additionalRoutes = this.additionalRoutes.filter(
      (route) => route.path != path,
    );
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
