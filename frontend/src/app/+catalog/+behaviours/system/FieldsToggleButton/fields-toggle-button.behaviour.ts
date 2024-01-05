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
import { Plugin } from "../../plugin";
import { SessionStore } from "../../../../store/session.store";
import { inject, Injectable } from "@angular/core";
import { PluginService } from "../../../../services/plugin/plugin.service";

@Injectable({ providedIn: "root" })
export class FieldsToggleButtonBehaviour extends Plugin {
  id = "plugin.show.all.toggle.button";
  name = "Anzeige aller Felder";
  group = "Andere";
  description =
    "Zeigt standardmäßig alle Felder eines Formulars an. Wenn ausgeschaltet, dann werden nur die Pflichtfelder und die explizit sichtbaren Felder angezeigt.";
  defaultActive = true;

  constructor(private sessionStore: SessionStore) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  register() {
    super.register();
    this.sessionStore.update((state) => {
      return {
        ui: {
          ...state.ui,
          toggleFieldsButtonShowAll: true,
        },
      };
    });
  }

  unregister() {
    super.unregister();
    this.sessionStore.update((state) => {
      return {
        ui: {
          ...state.ui,
          toggleFieldsButtonShowAll: false,
        },
      };
    });
  }
}
