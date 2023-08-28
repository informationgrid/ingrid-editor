import { inject, Injectable } from "@angular/core";
import { FormToolbarService } from "../../../../app/+form/form-shared/toolbar/form-toolbar.service";
import { IsoViewComponent } from "./iso-view.component";
import { MatDialog } from "@angular/material/dialog";
import { DocEventsService } from "../../../../app/services/event/doc-events.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { TreeQuery } from "../../../../app/store/tree/tree.query";
import { AddressTreeQuery } from "../../../../app/store/address-tree/address-tree.query";
import { ExchangeService } from "../../../../app/+importExport/exchange.service";
import { combineLatest, of } from "rxjs";
import { Plugin } from "../../../../app/+catalog/+behaviours/plugin";
import { PluginService } from "../../../../app/services/plugin/plugin.service";
import { catchError } from "rxjs/operators";

@UntilDestroy()
@Injectable({ providedIn: "root" })
export class IsoViewPlugin extends Plugin {
  id = "plugin.isoView";
  name = "ISO-Ansicht";
  group = "Toolbar";
  description =
    "Fügt einen Button hinzu, um sich eine Vorschau des ISO Exports anzeigen zu lassen.";
  defaultActive = false;

  private treeQuery: TreeQuery | AddressTreeQuery;

  constructor(
    private formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private dialog: MatDialog,
    private toolbarService: FormToolbarService,
    private docTreeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private exportService: ExchangeService
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

    // add button to toolbar
    this.formToolbarService.addButton({
      id: "toolBtnIso",
      tooltip: "ISO Ansicht",
      matSvgVariable: "ISO-Ansicht",
      eventId: "ISO",
      pos: 80,
      active: false,
    });

    this.treeQuery = this.forAddress
      ? this.addressTreeQuery
      : this.docTreeQuery;

    // react on event when button is clicked
    const toolbarEventSubscription = this.docEvents
      .onEvent("ISO")
      .subscribe(() => this.showISODialog());
    const openedDocSubscription = this.treeQuery.openedDocument$
      .pipe(untilDestroyed(this))
      .subscribe((openedDoc) => {
        this.toolbarService.setButtonState(
          "toolBtnIso",
          openedDoc !== null && openedDoc._type != "FOLDER"
        );
      });

    this.formSubscriptions.push(
      toolbarEventSubscription,
      openedDocSubscription
    );
  }

  private showISODialog() {
    const currentDocument = this.treeQuery.getOpenedDocument();
    const options = {
      id: currentDocument.id as number,
      useDraft: true,
      exportFormat: "ingridISO",
    };
    const optionsOnlyPublished = {
      id: currentDocument.id as number,
      useDraft: false,
      exportFormat: "ingridISO",
    };
    combineLatest([
      this.exportService.export(options),
      currentDocument._state === "PW"
        ? this.exportService.export(optionsOnlyPublished)
        : of(null),
    ])
      .pipe(
        catchError((error) => {
          throw new Error(
            "Probleme beim Erstellen der ISO-Ansicht. Bitte stellen Sie sicher, dass alle Pflichtfelder ausgefüllt sind."
          );
        })
      )
      .subscribe(async ([current, published]) => {
        this.dialog.open(IsoViewComponent, {
          data: {
            uuid: currentDocument._uuid,
            isoText: await current.body.text(),
            isoTextPublished: await published?.body.text(),
          },
        });
      });
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      this.formToolbarService.removeButton("toolBtnIso");
    }
  }
}
