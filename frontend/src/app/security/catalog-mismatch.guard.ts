/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { CatalogChangeService } from "./catalog-change.service";

/**
 * Runs on every navigation inside the catalog routes and blocks navigation
 * when the server session's current catalog no longer matches this tab
 * (e.g. the user switched catalogs in another tab or device).
 */
@Injectable({
  providedIn: "root",
})
export class CatalogMismatchGuard {
  constructor(private catalogChangeService: CatalogChangeService) {}

  async canActivateChild(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    return this.catalogChangeService.runGuardCheck(state.url);
  }
}
