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

@Injectable({
  providedIn: "root",
})
export class DoiPlugin extends Plugin {
  private formMenuService = inject(FormMenuService);
  private docEvents = inject(DocEventsService);
  private dialog = inject(MatDialog);

  id = "plugin.ingrid.doi";
  name = "DOI-Felder anzeigen";
  description = `Zeigt DOI-Felder im Formular unter der Rubrik "Fachbezug" an. In der Objektklasse "Literatur" wird dadurch das Feld "Dokumenttyp" ersetzt.
<p>Es kann ein Default-Präfix angegeben werden, der in neu angelegten Objekten automatisch eingefügt wird.</p>`;
  defaultActive = false;
  fields: any[] = [
    {
      key: "doiPrefix",
      type: "input",
      props: {
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
      },
    },
  ];
  private eventExportDataCite = "EXPORT_DATACITE";

  constructor() {
    super();

    inject(PluginService).registerPlugin(this);
    this.formMenuService.addToolbarMenuItem("publish", {
      eventId: this.eventExportDataCite,
      label: "Export DataCite",
      active: true,
    });

    const toolbarEventSubscription = [
      this.docEvents
        .onEvent(this.eventExportDataCite)
        .subscribe(() => this.exportDataCite()),
    ];
  }

  private exportDataCite() {
    console.log("Export DataCite");
    this.dialog.open(ExportDataCiteDialogComponent);
  }
}
