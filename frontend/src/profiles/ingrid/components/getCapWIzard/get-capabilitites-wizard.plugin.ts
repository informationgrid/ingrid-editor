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
import { effect, inject, Injectable, signal } from "@angular/core";
import { FormToolbarService } from "../../../../app/+form/form-shared/toolbar/form-toolbar.service";
import { DocEventsService } from "../../../../app/services/event/doc-events.service";
import { MatDialog } from "@angular/material/dialog";
import { GetCapabilitiesDialogComponent } from "../../../../app/formly/types/update-get-capabilities/get-capabilities-dialog/get-capabilities-dialog.component";
import { filter } from "rxjs/operators";
import { GetCapabilitiesService } from "../../../../app/formly/types/update-get-capabilities/get-capabilities-dialog/get-capabilities.service";
import {
  DocumentService,
  SaveOptions,
} from "../../../../app/services/document/document.service";
import { ConfigService } from "../../../../app/services/config/config.service";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GetCapabilitiesAnalysis } from "../../../../app/formly/types/update-get-capabilities/get-capabilities-dialog/get-capabilities.model";
import { Plugin } from "../../../../app/+catalog/+behaviours/plugin";
import { PluginService } from "../../../../app/services/plugin/plugin.service";
import { DocumentAbstract } from "../../../../app/store/document/document.model";
import { TreeStore } from "../../../../app/store/tree/tree.store";
import { trimObjectAndRemoveEvilTags } from "../../../../app/shared/utils";

@Injectable({
  providedIn: "root",
})
export class GetCapabilititesWizardPlugin extends Plugin {
  id = "plugin.getCapWizard";
  defaultActive = true;
  name = "Assistent für GetCapabilities";
  description =
    "Fügt einen Button hinzu, mit dem ein neuer Geodatendienst mit den Daten aus einem getCapabilities Dokument angelegt werden kann.";
  eventId = "WIZARD_GET_CAPABILITIES";
  hideInAddress = true;
  group = "Toolbar";

  private buttonId = "toolBtnWizardGetCap";

  private formToolbarService = inject(FormToolbarService);
  private docEvents = inject(DocEventsService);
  private dialog = inject(MatDialog);
  private getCapService = inject(GetCapabilitiesService);
  private documentService = inject(DocumentService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private treeStore = inject(TreeStore);
  private configService = inject(ConfigService);

  constructor() {
    super();
    inject(PluginService).registerPlugin(this);

    effect(async () => {
      if (
        !this.isActive() ||
        !this.formRegistered() ||
        this.configService.hasWriteRootPermission()
      )
        return;

      const activeNodes = this.generalStore.activeTreeNodes();
      const parentId =
        activeNodes.length === 0
          ? null
          : (await this.treeStore.byId(activeNodes[0]))._parent;
      if (
        activeNodes.length !== 1 ||
        this.treeStore.entityMap()[parentId] === null
      ) {
        this.formToolbarService.setButtonState(this.buttonId, false);
      } else {
        this.formToolbarService.setButtonState(this.buttonId, true);
      }
    });
  }

  registerForm() {
    super.registerForm();

    this.formToolbarService.addButton({
      id: this.buttonId,
      tooltip: "GetCapabilities-Assistent",
      matIconVariable: "auto_fix_normal",
      eventId: this.eventId,
      pos: 11,
      active: signal(true),
    });

    const toolbarEventSubscription = this.docEvents
      .onEvent(this.eventId)
      .subscribe(() => this.openWizard());

    this.formSubscriptions.push(toolbarEventSubscription);
  }

  private openWizard() {
    this.dialog
      .open(GetCapabilitiesDialogComponent, {
        minWidth: "min(700px, 100%)",
        maxWidth: "80vw",
        disableClose: true,
        hasBackdrop: true,
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((result) => this.updateDataset(result));
  }

  private async updateDataset(result: GetCapabilitiesAnalysis) {
    const snackRef = this.snack.open(
      "Der Geodatendienst wird angelegt und gleich geöffnet ...",
      null,
      { duration: 30000 },
    );
    const doc = this.generalStore.getOpenedDocument(false);
    const parentFolder =
      doc === null
        ? null
        : doc._type === "FOLDER"
          ? +doc.id
          : this.getFirstParentFolderId(doc);
    const model: any = {
      service: {},
      resource: {},
      spatial: {},
      temporal: { events: [] },
      keywords: { gemet: [], umthes: [], free: [] },
      themes: [],
    };
    await this.getCapService.applyChangesToModel(model, result, parentFolder);
    this.documentService
      .save(
        SaveOptions.createNewDocument(
          trimObjectAndRemoveEvilTags(model),
          "InGridGeoService",
          parentFolder,
          false,
          null,
        ),
      )
      .subscribe((result) => {
        this.router.navigate([
          `${ConfigService.catalogId}/form`,
          { id: result.metadata.uuid },
        ]);
        snackRef.dismiss();
      });
  }

  private getFirstParentFolderId(doc: DocumentAbstract) {
    const result = this.treeStore.getFirstParentFolder(doc.id as number)?.id;
    if (result === undefined) return null;
    return +result;
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive()) {
      this.formToolbarService.removeButton(this.buttonId);
    }
  }
}
