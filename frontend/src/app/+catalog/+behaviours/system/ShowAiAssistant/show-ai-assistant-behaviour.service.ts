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
  name = "Anzeige KI-Assistent";
  group = "Toolbar";
  description =
    "Fügt einen Button hinzu, mit dem der KI-Assistent neben dem Formular angezeigt werden kann.";
  defaultActive = false;

  private uiStore = inject(UiStore);
  private eventShowAiAssistantId = "SHOW_AI_ASSISTANT";

  constructor(
    private formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

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
      eventId: this.eventShowAiAssistantId,
      pos: 1002,
      active: true,
    });

    // add event handler for revert
    const toolbarEventSubscription = this.docEvents
      .onEvent(this.eventShowAiAssistantId)
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
