import { inject, Injectable } from "@angular/core";
import { Plugin } from "../../../../app/+catalog/+behaviours/plugin";
import { FormToolbarService } from "../../../../app/+form/form-shared/toolbar/form-toolbar.service";
import { DocEventsService } from "../../../../app/services/event/doc-events.service";
import { MatDialog } from "@angular/material/dialog";
import { GetCapabilitiesDialogComponent } from "../../../../app/formly/types/update-get-capabilities/get-capabilities-dialog/get-capabilities-dialog.component";
import { filter } from "rxjs/operators";
import { GetCapabilitiesService } from "../../../../app/formly/types/update-get-capabilities/get-capabilities-dialog/get-capabilities.service";
import { DocumentService } from "../../../../app/services/document/document.service";
import { IgeDocument } from "../../../../app/models/ige-document";
import { ConfigService } from "../../../../app/services/config/config.service";
import { Router } from "@angular/router";
import { FormPluginsService } from "../../../../app/+form/form-shared/form-plugins.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GetCapabilitiesAnalysis } from "../../../../app/formly/types/update-get-capabilities/get-capabilities-dialog/get-capabilities.model";
import { TreeQuery } from "../../../../app/store/tree/tree.query";

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
    inject(FormPluginsService).registerPlugin(this);
  }

  register() {
    super.register();

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
      this.subscriptions.push(treeQuerySubscription);
    }

    this.subscriptions.push(toolbarEventSubscription);
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
      { duration: 30000 }
    );
    const doc = this.treeQuery.getOpenedDocument();
    const parentFolder =
      doc === null
        ? null
        : doc._type === "FOLDER"
        ? doc.id
        : this.treeQuery.getFirstParentFolder(doc.id + "")?.id;
    const newDoc = new IgeDocument("InGridGeoService", +parentFolder);
    const model: IgeDocument = {
      ...newDoc,
      service: {},
      resource: {},
      spatial: {},
      temporal: { events: [] },
      keywords: {},
    };
    await this.getCapService.applyChangesToModel(model, result);
    this.documentService
      .save({
        data: model,
        isNewDoc: true,
      })
      .subscribe((result) => {
        this.router.navigate([
          `${ConfigService.catalogId}/form`,
          { id: result._uuid },
        ]);
        snackRef.dismiss();
      });
  }

  unregister() {
    super.unregister();
    this.formToolbarService.removeButton(this.buttonId);
  }
}
