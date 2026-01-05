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
import { Plugin } from "../../../app/+catalog/+behaviours/plugin";
import { inject, Injectable } from "@angular/core";
import { PluginService } from "../../../app/services/plugin/plugin.service";

@Injectable({ providedIn: "root" })
export class DataformatPlugin extends Plugin {
  id = "plugin.ingrid.dataformat";
  name = "Datenformat-Validierung";
  description = `Validiert die Datensätze und zeigt gegebenenfalls eine Empfehlung zum Befüllen des Feldes 'Datenformat'. Dieses sollte in den folgenden Situationen erfolgen:
<ul>
  <li>Bestellinformation nicht leer ist</li>
  <li>Gebühren nicht leer sind (nicht in allen Profilen vorhanden)</li>
  <li>Medienoption nicht leer ist</li>
  <li>"Geodatendienst"</li>
  <ul>
    <li>getCapabilities-Operation gesetzt ist</li>
    <li>"Als ATOM-Download Dienst bereitstellen" aktiv ist</li>
    <li>externe dargestellte Daten vorhanden sind</li>
  </ul>
  <li>"Anwendung" hat Service-URL</li>
  <li>"Geodatensatz" hat einen gekoppelten Dienst, welcher eine getCapabilities-Operation hat</li>
</ul>`;
  group = "Datensätze";

  defaultActive = true;

  constructor() {
    super();
    inject(PluginService).registerPlugin(this);
  }
}
