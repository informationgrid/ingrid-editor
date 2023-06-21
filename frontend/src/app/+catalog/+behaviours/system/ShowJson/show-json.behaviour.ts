import { inject, Injectable } from "@angular/core";
import { Plugin } from "../../plugin";
import { FormToolbarService } from "../../../../+form/form-shared/toolbar/form-toolbar.service";
import { SessionStore } from "../../../../store/session.store";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { FormPluginsService } from "../../../../+form/form-shared/form-plugins.service";

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
    private sessionStore: SessionStore
  ) {
    super();
    inject(FormPluginsService).registerPlugin(this);
  }

  register() {
    super.register();

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

    this.subscriptions.push(toolbarEventSubscription);
  }

  private toggleJSONView(forceState?: boolean) {
    this.sessionStore.update((state) => ({
      ui: {
        ...state.ui,
        showJSONView: forceState ?? !state.ui.showJSONView,
      },
    }));
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton("toolBtnShowJsonSeparator");
    this.formToolbarService.removeButton("toolBtnShowJson");

    this.toggleJSONView(false);
  }
}
