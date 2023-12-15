/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Injectable } from "@angular/core";
import { ModalService } from "../services/modal/modal.service";
import { ConfigService } from "../services/config/config.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard {
  constructor(
    private router: Router,
    private modalService: ModalService,
    private configService: ConfigService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const user = this.configService.$userInfo.getValue();
    const path = state.url;
    const catalogId = user.currentCatalog.id;

    if (
      user?.assignedCatalogs.length === 0 &&
      state.url.indexOf(`/${catalogId}/catalogs/manage`) === -1 &&
      state.url.indexOf(`/${catalogId}/settings/catalog`) === -1
    ) {
      this.router.navigate([`/${catalogId}/settings/catalog`]);
      return false;
    }

    let neededPermission = route.data.permission;
    const isAllowed = this.configService.hasPermission(neededPermission);
    if (isAllowed) {
      return true;
    }

    console.warn("User is not allowed to access this resource: " + path);
    this.router.navigate([ConfigService.catalogId]);
    return false;
  }

  private containsValidPage(validPages: string[], page: string) {
    return (
      validPages.length === 0 ||
      validPages.some((validPage) => validPage.indexOf(page) !== -1)
    );
  }
}
