/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { inject, Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { DocumentService } from "../services/document/document.service";
import { ConfigService } from "../services/config/config.service";
import { PluginService } from "../services/plugin/plugin.service";

@Injectable({
  providedIn: "root",
})
export class RedirectFormGuard {
  private router: Router = inject(Router);
  private documentService: DocumentService = inject(DocumentService);
  private pluginService: PluginService = inject(PluginService);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    const basePath = `/${ConfigService.catalogId}`;
    const formPath = `${basePath}/form`;
    const addressPath = `${basePath}/address`;

    const isFormUrl = state.url.startsWith(formPath);
    const isAddressUrl = state.url.startsWith(addressPath);

    // in case we come from a different page to the data/address-page
    if (isFormUrl && !this.router.url.startsWith(formPath)) {
      this.handleVisitDocPageFromExtern(route.params.id);
    } else if (isAddressUrl && !this.router.url.startsWith(addressPath)) {
      this.handleVisitAddressPageFromExtern(route.params.id);
    }

    return true;
  }

  private handleVisitAddressPageFromExtern(uuid: string) {
    this.pluginService.pluginState$.next({
      register: true,
      address: true,
    });
    if (uuid) this.reloadDataset(uuid, true);
  }

  private handleVisitDocPageFromExtern(uuid: string) {
    this.pluginService.pluginState$.next({
      register: true,
      address: false,
    });
    if (uuid) this.reloadDataset(uuid, false);
  }

  private reloadDataset(uuid: string, forAddress: boolean) {
    this.documentService.reload$.next({
      uuid: uuid,
      forAddress: forAddress,
    });
  }
}
