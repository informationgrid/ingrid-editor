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
