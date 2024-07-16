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
import { inject, Injectable } from "@angular/core";
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
import { TreeQuery } from "../../../../app/store/tree/tree.query";
import { Plugin } from "../../../../app/+catalog/+behaviours/plugin";
import { PluginService } from "../../../../app/services/plugin/plugin.service";

@Injectable({
  providedIn: "root",
})
export class GetCapabilititesWizardPlugin extends Plugin {
  id = "plugin.getCapWizard";
  defaultActive = true;
  name = "Assistent für GetCapabilities";
  description =
    "Es erscheint ein neuer Toolbar-Button über den es möglich ist, einen neuen Geodatendienst hinzuzufügen mit den Daten aus einem getCapabilities Dokument.";
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
  private treeQuery = inject(TreeQuery);
  private configService = inject(ConfigService);

  constructor() {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

    this.formToolbarService.addButton({
      id: this.buttonId,
      tooltip: "GetCapabilities-Assistent",
      matIconVariable: "auto_fix_normal",
      eventId: this.eventId,
      pos: 11,
      active: true,
    });

    const toolbarEventSubscription = this.docEvents
      .onEvent(this.eventId)
      .subscribe(() => this.openWizard());

    if (!this.configService.hasWriteRootPermission()) {
      const treeQuerySubscription = this.treeQuery
        .selectActive()
        .subscribe(async (data) => {
          if (
            data.length !== 1 ||
            this.treeQuery.getEntity(data[0]._parent) === null
          ) {
            this.formToolbarService.setButtonState(this.buttonId, false);
          } else {
            this.formToolbarService.setButtonState(this.buttonId, true);
          }
        });
      this.formSubscriptions.push(treeQuerySubscription);
    }

    this.formSubscriptions.push(toolbarEventSubscription);
  }

  private openWizard() {
    this.dialog
      .open(GetCapabilitiesDialogComponent, {
        minWidth: 700,
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
    const doc = this.treeQuery.getOpenedDocument();
    const parentFolder =
      doc === null
        ? null
        : doc._type === "FOLDER"
          ? doc.id
          : this.treeQuery.getFirstParentFolder(doc.id + "")?.id;
    const model: any = {
      service: {},
      resource: {},
      spatial: {},
      temporal: { events: [] },
      keywords: { gemet: [], umthes: [], free: [] },
      themes: [],
    };
    await this.getCapService.applyChangesToModel(model, result);
    this.documentService
      .save(
        SaveOptions.createNewDocument(
          model,
          "InGridGeoService",
          parentFolder ? +parentFolder : null,
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

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      this.formToolbarService.removeButton(this.buttonId);
    }
  }
}
