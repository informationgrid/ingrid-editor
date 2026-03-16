/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { Plugin } from "../../../app/+catalog/+behaviours/plugin";
import { PluginService } from "../../../app/services/plugin/plugin.service";
import { FormMenuService } from "../../../app/+form/form-menu.service";
import { DocEventsService } from "../../../app/services/event/doc-events.service";
import { MatDialog } from "@angular/material/dialog";
import { ExportDataCiteDialogComponent } from "./export-data-cite-dialog/export-data-cite-dialog.component";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { BehaviourService } from "../../../app/services/behavior/behaviour.service";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { FormUtils } from "../../../app/+form/form.utils";
import { FormStateService } from "../../../app/+form/form-state.service";
import { DocumentService } from "../../../app/services/document/document.service";

@Injectable({
  providedIn: "root",
})
export class DoiPlugin extends Plugin {
  private formMenuService = inject(FormMenuService);
  private docEvents = inject(DocEventsService);
  private dialog = inject(MatDialog);
  private behaviourService = inject(BehaviourService);
  private formStateService = inject(FormStateService);
  private documentService = inject(DocumentService);

  id = "plugin.ingrid.doi";
  name = "DOI-Felder anzeigen";
  description = `Zeigt DOI-Felder im Formular unter der Rubrik "Fachbezug" an. In der Objektklasse "Literatur" wird dadurch das Feld "Dokumenttyp" ersetzt.
<p>Es kann ein Default-Präfix angegeben werden, der in neu angelegten Objekten automatisch eingefügt wird.</p><p>Bitte nach Änderung des Default-Präfix die Seite neu laden.</p>`;
  defaultActive = false;
  fields: FormlyFieldConfig[] = [
    {
      key: "doiPrefix",
      type: "input",
      props: {
        label: "Default-Präfix",
        placeholder: "Default-Präfix für DOI-Einträge, Format: 10.VXYZ",
        appearance: "outline",
        required: false,
      },
      modelOptions: {
        updateOn: "blur",
      },
      validators: {
        validation: ["doiPrefix"],
      },
    },
    {
      key: "exportDataCite",
      type: "checkbox",
      defaultValue: false,
      wrappers: [],
      props: {
        label: "Export nach DataCite",
        change: (_field, event: MatCheckboxChange) => {
          if (event.checked) this.addDataCiteMenu();
          else this.removeDataCiteMenu();
        },
      },
    },
    {
      key: "dataCiteURL",
      type: "input",
      defaultValue: "https://api.test.datacite.org",
      wrappers: ["form-field"],
      // className: "padding",
      props: {
        label: "DataCite-URL",
        appearance: "outline",
      },
      expressions: {
        hide: (field: FormlyFieldConfig) => !field.model.exportDataCite,
      },
    },
    {
      key: "dataCiteDetailURL",
      type: "input",
      defaultValue: "https://datenrepository.baw.de/trefferanzeige?docuuid=",
      wrappers: ["form-field"],
      // className: "padding",
      props: {
        label: "Detail-URL im Portal",
        appearance: "outline",
      },
      expressions: {
        hide: (field: FormlyFieldConfig) => !field.model.exportDataCite,
      },
    },
  ];
  private eventExportDataCite = "EXPORT_DATACITE";

  constructor() {
    super();

    inject(PluginService).registerPlugin(this);
  }

  register() {
    super.register();

    const behaviour = this.behaviourService.getBehaviour("plugin.ingrid.doi");
    if (behaviour.isActive && behaviour.data.exportDataCite) {
      this.formMenuService.addToolbarMenuItem("publish", {
        eventId: this.eventExportDataCite,
        label: "Export DataCite",
        active: true,
      });

      this.subscriptions.push(
        this.docEvents
          .onEvent(this.eventExportDataCite)
          .subscribe(() => this.exportDataCite()),
      );
    }
  }

  unregister() {
    super.unregister();
    this.removeDataCiteMenu();
  }

  private async exportDataCite() {
    const handled = await FormUtils.handleDirtyForm(
      this.formStateService,
      this.documentService,
      this.dialog,
      this.forAddress(),
    );
    if (handled) this.dialog.open(ExportDataCiteDialogComponent);
  }

  private removeDataCiteMenu() {
    this.formMenuService.removeToolbarMenuItems(
      "publish",
      this.eventExportDataCite,
    );
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  private addDataCiteMenu() {
    this.formMenuService.addToolbarMenuItem("publish", {
      eventId: this.eventExportDataCite,
      label: "Export DataCite",
      active: true,
    });

    // change - event is called twice somehow, so we must make sure we only subscribe once
    if (this.subscriptions.length === 0) {
      this.subscriptions.push(
        this.docEvents
          .onEvent(this.eventExportDataCite)
          .subscribe(() => this.exportDataCite()),
      );
    }
  }
}
