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
import { FormToolbarService } from "../../../../+form/form-shared/toolbar/form-toolbar.service";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";
import { UiStore } from "../../../../store/ui.store";

@Injectable()
export class ShowAiAssistantBehaviour extends Plugin {
  id = "plugin.show.ai-assistant";
  group = "Künstliche Intelligenz (Beta)";
  defaultActive = false;

  name = "KI-Assistent aktivieren";
  description = `
    Die Aktivierung ermöglicht die folgenden Funktionen in einzelnen Bereichen:
    <ul>
      <li>KI-Analyse: bewerte die Qualität einzelner Datensätze und erhalte konkrete Verbesserungsvorschläge.</li>
      <li>KI-Konfiguration: verwalte zentrale Einstellungen wie KI-Server, Modelle und Prompts.</li>
      <li>KI-Qualitätsanalyse: analysiere alle veröffentlichten Datensätze und erhalte eine Gesamtbewertung des Katalogs.</li>
    </ul>
  `;

  private uiStore = inject(UiStore);
  private showAiAssistantEventId = "SHOW_AI_ASSISTANT";

  constructor(
    private formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

    // Add the access to AI functionality to the toolbar.
    this.formToolbarService.addButton({
      id: "toolBtnShowAiAssistantSeparator",
      pos: 1001,
      type: "separator",
    });
    this.formToolbarService.addButton({
      type: "button",
      id: "toolBtnShowAiAssistant",
      tooltip: "KI-Assistent anzeigen",
      matIconVariable: "auto_awesome",
      eventId: this.showAiAssistantEventId,
      pos: 1002,
      active: true,
    });

    // Add a click handler for the button in the toolbar.
    const toolbarEventSubscription = this.docEvents
      .onEvent(this.showAiAssistantEventId)
      .subscribe(() => this.toggleAiView());

    this.formSubscriptions.push(toolbarEventSubscription);
  }

  private toggleAiView(forceState?: boolean) {
    this.uiStore.toggleAiAssistantView(forceState);
  }

  unregisterForm() {
    super.unregisterForm();

    this.formToolbarService.removeButton("toolBtnShowAiAssistantSeparator");
    this.formToolbarService.removeButton("toolBtnShowAiAssistant");

    this.toggleAiView(false);
  }
}
