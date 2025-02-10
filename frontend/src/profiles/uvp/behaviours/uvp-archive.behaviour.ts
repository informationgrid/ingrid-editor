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
import { Plugin } from "../../../app/+catalog/+behaviours/plugin";
import { inject, Injectable } from "@angular/core";
import { AuthGuard } from "../../../app/security/auth.guard";
import { CatalogRoutesService } from "../../../app/+catalog/catalog-routes.service";
import { Router } from "@angular/router";
import { SelectOptionUi } from "../../../app/services/codelist/codelist.service";
import { TranslocoService } from "@ngneat/transloco";

@Injectable({ providedIn: "root" })
export class UvpArchiveBehaviour extends Plugin {
  private transloco = inject(TranslocoService);

  id = "plugin.uvp.archive";
  name = "UVP Archivierung";
  description = `Erweiterungen für die Archivierung von UVP-Dokumenten.
  <ul>
    <li>${this.transloco.translate("uvp.archive.hideAll")}</li>
    <li>${this.transloco.translate("uvp.archive.showAll")}</li>
    <li>${this.transloco.translate("uvp.archive.showOnlyDecision")}</li>
  </ul>`;
  defaultActive = true;
  group = "UVP";
  hide = false;

  private catalogRouteService = inject(CatalogRoutesService);
  private router = inject(Router);

  constructor() {
    super();

    this.fields.push({
      key: "uvpArchiveType",
      type: "radio",
      defaultValue: "showAll",
      wrappers: ["form-field"],
      props: {
        labelProp: "label",
        valueProp: "value",
        appearance: "outline",
        options: [
          { value: "hideAll", label: "Alle Dokumente im Portal ausblenden" },
          {
            value: "showAll",
            label: "Alle Dokumente im Portal sichtbar belassen",
          },
          {
            value: "showOnlyDecision",
            label: "Nur Dokumente der Entscheidung sichtbar belassen",
          },
        ],
        required: true,
      },
    });
  }

  register() {
    super.register();
    this.addUVPArchiveTab();
  }

  unregister() {
    super.unregister();
    this.removeUVPArchiveTab();
  }

  private addUVPArchiveTab() {
    const route = {
      canActivate: [AuthGuard],
      path: "uvp-archive",
      loadComponent: () =>
        import("../config/uvp-archive/uvp-archive.component").then(
          (m) => m.UvpArchiveComponent,
        ),
      data: {
        title: "UVP Archivierung",
        permission: "can_create_uvp_report",
      },
    };
    this.catalogRouteService.addRoute(route);

    // TODO: only on click, because lazy-loaded
    /*let routerConfig = [...this.router.config];
    // @ts-ignore
    if (!routerConfig[0].children[7]._loadedRoutes) return;
    // @ts-ignore
    routerConfig[0].children[7]._loadedRoutes.push(route);
    this.router.resetConfig(routerConfig);
    setTimeout(
      () =>
        this.router.navigate([
          `${ConfigService.catalogId}/catalogs/uvp-archive`,
        ]),
      2000,
    );*/
  }

  private removeUVPArchiveTab() {
    // this.catalogRouteService.
  }
}
