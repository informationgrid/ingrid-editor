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

@Injectable()
export class GetCapabilititesWizardPlugin extends Plugin {
  id = "plugin.getCapWizard";
  defaultActive = true;
  name = "Assistent für GetCapabilities";
  description =
    "Es erscheint ein neuer Toolbar-Button über den es möglich ist, einen neuen Geodatendienst hinzuzufügen mit den Daten aus einem getCapabilities Dokument.";
  eventId = "WIZARD_GET_CAPABILITIES";
  hideInAddress = true;

  private buttonId = "toolBtnWizardGetCap";

  private formToolbarService = inject(FormToolbarService);
  private docEvents = inject(DocEventsService);
  private dialog = inject(MatDialog);
  private getCapService = inject(GetCapabilitiesService);
  private documentService = inject(DocumentService);
  private router = inject(Router);

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

  private async updateDataset(result: any) {
    const newDoc = new IgeDocument("InGridGeoService", null);
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
      });
  }

  unregister() {
    super.unregister();
    this.formToolbarService.removeButton(this.buttonId);
  }
}
