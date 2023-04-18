import { Injectable } from "@angular/core";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { IsoViewComponent } from "./iso-view.component";
import { MatDialog } from "@angular/material/dialog";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { TreeQuery } from "../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { ExchangeService } from "../../../+importExport/exchange.service";
import { HttpResponse } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { combineLatest, of } from "rxjs";

@UntilDestroy()
@Injectable()
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

    this.subscriptions.push(toolbarEventSubscription, openedDocSubscription);
  }

  private showISODialog() {
    const options = {
      id: this.treeQuery.getOpenedDocument().id as number,
      useDraft: true,
      exportFormat: "ingridIDF",
    };
    const optionsOnlyPublished = {
      id: this.treeQuery.getOpenedDocument().id as number,
      useDraft: false,
      exportFormat: "ingridIDF",
    };
    combineLatest([
      this.exportService.export(options),
      this.treeQuery.getOpenedDocument()._state === "PW"
        ? this.exportService.export(optionsOnlyPublished)
        : of(null),
    ]).subscribe(async ([current, published]) => {
      this.dialog.open(IsoViewComponent, {
        data: {
          isoText: await current.body.text(),
          isoTextPublished: await published?.body.text(),
        },
      });
    });
  }

  unregister() {
    super.unregister();
    this.formToolbarService.removeButton("toolBtnIso");
  }

  private handleError(error: any) {
    return undefined;
  }
}
