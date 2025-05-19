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
import { IsoViewComponent } from "./iso-view.component";
import { MatDialog } from "@angular/material/dialog";
import { DocEventsService } from "../../../../app/services/event/doc-events.service";
import { UntilDestroy } from "@ngneat/until-destroy";
import { ExchangeService } from "../../../../app/+importExport/exchange.service";
import { of } from "rxjs";
import { Plugin } from "../../../../app/+catalog/+behaviours/plugin";
import { PluginService } from "../../../../app/services/plugin/plugin.service";

@UntilDestroy()
@Injectable({ providedIn: "root" })
export class IsoViewPlugin extends Plugin {
  id = "plugin.isoView";
  name = "ISO-Ansicht";
  group = "Toolbar";
  description =
    "Fügt einen Button hinzu, um sich eine Vorschau des ISO Exports anzeigen zu lassen.";
  defaultActive = false;

  isoExportFormat = "ingridISO";

  constructor(
    private formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private dialog: MatDialog,
    private toolbarService: FormToolbarService,
    private exportService: ExchangeService,
  ) {
    super();
    inject(PluginService).registerPlugin(this);

    effect(() => {
      if (!this.isActive() || !this.formRegistered()) return;
      const openedDoc = this.generalStore.getOpenedDocument(this.forAddress());
      this.toolbarService.setButtonState(
        "toolBtnIso",
        openedDoc !== null && openedDoc._type != "FOLDER",
      );
    });
  }

  registerForm() {
    super.registerForm();

    // add button to toolbar
    this.formToolbarService.addButton({
      id: "toolBtnIso",
      tooltip: "ISO Ansicht",
      matSvgVariable: "ISO-Ansicht",
      eventId: "ISO",
      pos: 80,
      active: signal(false),
    });

    // react on event when button is clicked
    const toolbarEventSubscription = this.docEvents
      .onEvent("ISO")
      .subscribe(() => this.showISODialog());

    this.formSubscriptions.push(toolbarEventSubscription);
  }

  private showISODialog() {
    const currentDocument = this.generalStore.getOpenedDocument(
      this.forAddress(),
    );
    const options = {
      ids: [currentDocument.id as number],
      useDraft: true,
      exportFormat: this.isoExportFormat,
    };
    const optionsOnlyPublished = {
      ids: [currentDocument.id as number],
      useDraft: false,
      exportFormat: this.isoExportFormat,
    };

    this.dialog.open(IsoViewComponent, {
      data: {
        uuid: currentDocument._uuid,
        isoText: this.exportService.export(options),
        isoTextPublished:
          currentDocument._state === "PW"
            ? this.exportService.export(optionsOnlyPublished)
            : of(null),
      },
    });
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive()) {
      this.formToolbarService.removeButton("toolBtnIso");
    }
  }
}
