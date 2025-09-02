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
export class ToggleWriteAccessInTreeBehaviour extends Plugin {
  id = "plugin.show.writable.tree";
  name = "Anzeige von Datensätzen mit nur Schreibrechten";
  group = "Baum";
  defaultActive = false;

  description =
    "Fügt einen neuen Button hinzu, der die Datensätze ohne Schreibrechte ausblendet. Dieser Button wird nicht für Super-Admins und Katalogadministratoren angezeigt, da diese auf alles Schreibrechte haben.";

  constructor() {
    super();

    inject(PluginService).registerPlugin(this);
  }
}
