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
import { inject, Injectable } from "@angular/core";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";

@Injectable({
  providedIn: "root",
})
export class DoiBehaviour extends Plugin {
  id = "plugin.doi";
  name = "DOI-Felder anzeigen";
  description = `Zeigt DOI-Felder im Formular unter der Rubrik "Fachbezug" an. In der Objektklasse "Literatur" wird dadurch das Feld "Dokumenttyp" ersetzt.
<p>Es kann ein Default-Präfix angegeben werden, der in neu angelegten Objekten automatisch eingefügt wird.</p>`;
  defaultActive = false;

  constructor() {
    super();

    this.fields.push({
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
    });

    inject(PluginService).registerPlugin(this);
  }
}
