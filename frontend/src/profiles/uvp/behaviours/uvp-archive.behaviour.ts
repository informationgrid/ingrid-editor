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
import { TranslocoService } from "@jsverse/transloco";
import {
  FormToolbarService,
  ToolbarItem,
} from "../../../app/+form/form-shared/toolbar/form-toolbar.service";
import { TreeStore } from "../../../app/store/tree/tree.store";
import { AddressTreeStore } from "../../../app/store/address-tree/address-tree.store";
import { DocEventsService } from "../../../app/services/event/doc-events.service";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../app/dialogs/confirm/confirm-dialog.component";
import { BehaviourService } from "../../../app/services/behavior/behaviour.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { ConfigService } from "../../../app/services/config/config.service";
import { DocumentAbstract } from "../../../app/store/document/document.model";

@Injectable({ providedIn: "root" })
export class UvpArchiveBehaviour extends Plugin {
  private transloco = inject(TranslocoService);
  private formToolbarService = inject(FormToolbarService);
  private docEvents = inject(DocEventsService);
  private dialog = inject(MatDialog);
  // private archivePluginActive =
  //   inject(BehaviourService).getBehaviour("plugin.archive").isActive;

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
  private configService = inject(ConfigService);

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

    if (!DocumentService.archivePluginActive) return;

    this.formToolbarService.setToolbarButtonEnabledFn(
      "toolBtnRemove",
      this.disableForAuthorsAndArchivedDocument(),
    );
    this.formToolbarService.setToolbarButtonEnabledFn(
      "toolBtnCopy.copy",
      this.disableForAuthorsAndArchivedDocument(),
    );
    this.setPluginConfig();

    effect(() => {
      if (!this.formRegistered()) return;
      this.toggleUpdateArchiveButton();
    });
  }

  private disableForAuthorsAndArchivedDocument() {
    return (docs: DocumentAbstract[]) => {
      return docs.every(
        (doc) =>
          !this.configService.isAuthor() ||
          !doc._tags?.split(",")?.includes("archived"),
      );
    };
  }

  register() {
    super.register();
    this.addUVPArchiveTab();
  }

  registerForm() {
    super.registerForm();

    if (!DocumentService.archivePluginActive) return;

    this.formSubscriptions.push(
      this.docEvents.onEvent("UPDATE_ARCHIVE").subscribe(() => {
        this.dialog
          .open(ConfirmDialogComponent, {
            data: <ConfirmDialogData>{
              title: "Archiv aktualisieren",
              message:
                "Wollen Sie dieses Vorhaben wirklich im Archiv aktualisieren?",
              buttons: [
                { text: "Abbrechen" },
                {
                  text: "Im Archiv speichern",
                  id: "confirm",
                  emphasize: true,
                  alignRight: true,
                },
              ],
            },
            maxWidth: 700,
            delayFocusTrap: true,
          })
          .afterClosed()
          .subscribe((result) => {
            if (result !== "confirm") return;

            this.docEvents.sendEvent({
              type: "PUBLISH",
              data: { withoutConfirmation: true },
            });
          });
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
    const saveBtn = this.formToolbarService.getButtonById(
      "toolBtnSave",
    ) as ToolbarItem;
    const isArchivedDocs = this.activeNodes()
      .map((item) => this.getStore().entityMap()[item])
      .map((doc) => doc?._tags?.split(",")?.includes("archived"));

    if (isArchivedDocs.length === 1 && isArchivedDocs[0] === true) {
      if (!this.formToolbarService.getButtonById("toolBtnUpdateArchive")) {
        this.formToolbarService.addButton(this.archiveUpdateBtn);
        publishBtn.hidden = true;
        saveBtn.hidden = true;
      }
    } else {
      this.formToolbarService.removeButton("toolBtnUpdateArchive");
      publishBtn.hidden = false;
      saveBtn.hidden = false;
    }
  }
}
