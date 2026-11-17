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
import { FormlyFieldConfig } from "@ngx-formly/core";

@Injectable({
  providedIn: "root",
})
export class MobilithekPlugin extends Plugin {
  id = "plugin.ingrid.mobilithek";
  name = "Mobilithek Schlagwörter anzeigen";
  description = `Ermöglicht die Auswahl von Mobilithek Schlagwörtern im Formular`;
  defaultActive = false;
  fields: FormlyFieldConfig[] = [
    {
      key: "required",
      type: "checkbox",
      defaultValue: false,
      wrappers: [],
      props: { label: "Angabe verpflichtend" },
    },
  ];

  constructor() {
    super();

    inject(PluginService).registerPlugin(this);
  }

  register() {
    super.register();
  }

  unregister() {
    super.unregister();
  }
}
