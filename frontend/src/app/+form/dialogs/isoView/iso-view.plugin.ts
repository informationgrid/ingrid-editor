import { Injectable } from "@angular/core";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { IsoViewComponent } from "./iso-view.component";
import { MatDialog } from "@angular/material/dialog";
import { DocEventsService } from "../../../services/event/doc-events.service";

@Injectable()
export class IsoViewPlugin extends Plugin {
  id = "plugin.isoView";
  name = "Iso View Plugin";
  description = "";
  defaultActive = true;

  constructor(
    private formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private dialog: MatDialog
  ) {
    super();
  }

  register() {
    super.register();

    // add button to toolbar
    this.formToolbarService.addButton({
      id: "toolBtnIso",
      tooltip: "ISO Ansicht",
      matIconVariable: "remove_red_eye",
      eventId: "ISO",
      pos: 80,
      active: false,
    });

    // react on event when button is clicked
    const toolbarEventSubscription = this.docEvents
      .onEvent("ISO")
      .subscribe(() => this.showISODialog());

    this.subscriptions.push(toolbarEventSubscription);
  }

  private showISODialog() {
    // show dialog where to copy the dataset(s)
    this.dialog.open(IsoViewComponent);
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton("toolBtnIso");
  }
}
