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
import { effect, inject, Injectable, signal } from "@angular/core";
import { AuthGuard } from "../../../app/security/auth.guard";
import { CatalogRoutesService } from "../../../app/+catalog/catalog-routes.service";
import { Router } from "@angular/router";
import { TranslocoService } from "@jsverse/transloco";
import {
  FormToolbarService,
  ToolbarItem,
} from "../../../app/+form/form-shared/toolbar/form-toolbar.service";
import { TreeStore } from "../../../app/store/tree/tree.store";
import { AddressTreeStore } from "../../../app/store/address-tree/address-tree.store";
import { IgeEvent } from "../../../app/services/event/event.service";
import { DocEventsService } from "../../../app/services/event/doc-events.service";

@Injectable({ providedIn: "root" })
export class UvpArchiveBehaviour extends Plugin {
  private transloco = inject(TranslocoService);
  private formToolbarService = inject(FormToolbarService);
  private docEvents = inject(DocEventsService);

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

  private documentTreeStore = inject(TreeStore);
  private addressTreeStore = inject(AddressTreeStore);

  private archiveUpdateBtn: ToolbarItem = {
    id: "toolBtnUpdateArchive",
    label: "Im Archiv speichern",
    eventId: "UPDATE_ARCHIVE",
    pos: 100,
    align: "right",
    active: signal(true),
  };

  constructor() {
    super();

    this.formToolbarService.setToolbarButtonEnabledFn(
      "toolBtnRemove",
      (docs) => {
        return docs.every(
          (doc) => !doc._tags?.split(",")?.includes("archived"),
        );
      },
    );
    this.setPluginConfig();

    effect(() => {
      if (!this.formRegistered()) return;
      this.toggleUpdateArchiveButton();
    });
  }

  register() {
    super.register();
    this.addUVPArchiveTab();
  }

  registerForm() {
    super.registerForm();

    this.formSubscriptions.push(
      this.docEvents.onEvent("UPDATE_ARCHIVE").subscribe(() => {
        /*const docs = this.activeNodes().map((item) => this.getStore().entityMap()[item]);
        if (docs.length > 0) {
          this.eventService
            .sendEventAndContinueOnSuccess(IgeEvent.DELETE, docs)
            .subscribe(() => this.showDeleteDialog(docs));
        }*/
        console.log("UPDATE_ARCHIVE");
      }),
    );
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

  private setPluginConfig() {
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

  private getStore() {
    return this.forAddress() ? this.addressTreeStore : this.documentTreeStore;
  }

  private toggleUpdateArchiveButton() {
    const publishBtn = this.formToolbarService.getButtonById(
      "toolBtnPublish",
    ) as ToolbarItem;
    const isArchivedDocs = this.activeNodes()
      .map((item) => this.getStore().entityMap()[item])
      .map((doc) => doc?._tags?.split(",")?.includes("archived"));

    if (isArchivedDocs.length === 1 && isArchivedDocs[0] === true) {
      if (!this.formToolbarService.getButtonById("toolBtnUpdateArchive")) {
        this.formToolbarService.addButton(this.archiveUpdateBtn);
        publishBtn.hidden = true;
      }
    } else {
      this.formToolbarService.removeButton("toolBtnUpdateArchive");
      publishBtn.hidden = false;
    }
  }
}
