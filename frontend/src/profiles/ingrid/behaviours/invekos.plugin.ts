import { Plugin } from "../../../app/+catalog/+behaviours/plugin";
import { inject, Injectable } from "@angular/core";
import { PluginService } from "../../../app/services/plugin/plugin.service";

@Injectable({ providedIn: "root" })
export class InvekosPlugin extends Plugin {
  id = "plugin.ingrid.invekos";
  name = "InVeKos-Daten";
  description =
    "Ermöglicht die Eingabe von InVeKoS (Integriertes Verwaltungs- und Kontrollsystem) - Daten";
  group = "Datensätze";

  defaultActive = true;

  constructor() {
    super();
    inject(PluginService).registerPlugin(this);
  }
}
