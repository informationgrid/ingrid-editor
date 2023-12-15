/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { SessionStore } from "../../../../store/session.store";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";

@Injectable()
export class ShowJsonBehaviour extends Plugin {
  id = "plugin.show.json";
  name = "Anzeige JSON Formular";
  group = "Toolbar";
  description =
    "Ein neuer Button ermöglicht die Anzeige des JSON-Dokuments neben dem Formular.";
  defaultActive = false;
  private eventShowJsonId = "SHOW_JSON";

  constructor(
    private formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private sessionStore: SessionStore,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

    this.formToolbarService.addButton({
      id: "toolBtnShowJsonSeparator",
      pos: 999,
      isSeparator: true,
    });
    this.formToolbarService.addButton({
      id: "toolBtnShowJson",
      tooltip: "JSON anzeigen",
      matIconVariable: "bug_report",
      eventId: this.eventShowJsonId,
      pos: 1000,
      active: true,
    });

    // add event handler for revert
    const toolbarEventSubscription = this.docEvents
      .onEvent(this.eventShowJsonId)
      .subscribe(() => this.toggleJSONView());

    this.formSubscriptions.push(toolbarEventSubscription);
  }

  private toggleJSONView(forceState?: boolean) {
    this.sessionStore.update((state) => ({
      ui: {
        ...state.ui,
        showJSONView: forceState ?? !state.ui.showJSONView,
      },
    }));
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      this.formToolbarService.removeButton("toolBtnShowJsonSeparator");
      this.formToolbarService.removeButton("toolBtnShowJson");

      this.toggleJSONView(false);
    }
  }
}
