import { Injectable } from "@angular/core";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import {
  FormToolbarService,
  Separator,
  ToolbarItem,
} from "../../form-shared/toolbar/form-toolbar.service";
import { PrintViewDialogComponent } from "./print-view-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { TreeQuery } from "../../../store/tree/tree.query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { ProfileService } from "../../../services/profile.service";
import { FormStateService } from "../../form-state.service";
import { DocumentDataService } from "../../../services/document/document-data.service";
import { combineLatest } from "rxjs";
import { JsonDiffMerge } from "../../../shared/utils";

@UntilDestroy()
@Injectable()
export class PrintViewPlugin extends Plugin {
  id = "plugin.printView";
  name = "Vorschau";
  description =
    "Fügt einen Button hinzu, um sich eine Vorschau anzeigen zu lassen.";
  group = "Toolbar";
  defaultActive = true;

  private treeQuery: TreeQuery | AddressTreeQuery;

  constructor(
    private documentDataService: DocumentDataService,
    private toolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private docTreeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private dialog: MatDialog,
    private profileService: ProfileService,
    private formService: FormStateService
  ) {
    super();
  }

  register() {
    super.register();

    // add button to toolbar
    const buttons: Array<ToolbarItem | Separator> = [
      // { id: 'toolBtnCopyCutSeparator', pos: 60, isSeparator: true },
      {
        id: "toolBtnPrint",
        tooltip: "Vorschau",
        matSvgVariable: "Vorschau-Druckansicht",
        eventId: "PRINT",
        pos: 20,
        active: false,
      },
    ];
    buttons.forEach((button, index) => this.toolbarService.addButton(button));

    this.treeQuery = this.forAddress
      ? this.addressTreeQuery
      : this.docTreeQuery;

    this.subscriptions.push(
      // react on event when button is clicked
      this.docEvents.onEvent("PRINT").subscribe(() => this.showPrintDialog()),

      this.treeQuery.openedDocument$
        .pipe(untilDestroyed(this))
        .subscribe((openedDoc) => {
          this.toolbarService.setButtonState(
            "toolBtnPrint",
            openedDoc !== null && openedDoc._type != "FOLDER"
          );
        })
    );
  }

  private showPrintDialog() {
    let openedDocument = this.treeQuery.getOpenedDocument();
    const type = openedDocument._type;
    const profile = this.profileService.getProfile(type);
    combineLatest([
      this.documentDataService.load(openedDocument._uuid, true),
      this.documentDataService.loadPublished(openedDocument._uuid, true),
    ]).subscribe((result) => {
      const diff = JsonDiffMerge.jsonDiff(
        { ...result[0] },
        { ...result[1] },
        {}
      );
      this.dialog.open(PrintViewDialogComponent, {
        width: "80%",
        data: {
          fields: profile.getFieldsForPrint(diff),
          model: { ...result[0] },
          modelPublished: { ...result[1] },
        },
      });
    });
  }

  unregister() {
    super.unregister();
    this.toolbarService.removeButton("toolBtnPrint");
  }
}
