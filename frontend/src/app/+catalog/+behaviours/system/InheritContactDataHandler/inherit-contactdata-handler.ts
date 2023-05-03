import { Injectable } from "@angular/core";
import { Plugin } from "../../plugin";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { map } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { combineLatest, Observable } from "rxjs";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../../dialogs/confirm/confirm-dialog.component";
import { DocumentService } from "../../../../services/document/document.service";
import { DocumentDataService } from "../../../../services/document/document-data.service";

@Injectable()
export class InheritContactDataHandler extends Plugin {
  id = "plugin.inherit.contact.data.handler";
  name = "Kontaktangaben der übergeordneten Adresse übernehmen";
  description = "";
  group = "Adressen";
  defaultActive = true;
  forAddress = true;

  constructor(
    private docEvents: DocEventsService,
    private dialog: MatDialog,
    private documentDataService: DocumentDataService,
    private documentService: DocumentService
  ) {
    super();
  }

  register() {
    super.register();

    const onEvent = this.docEvents
      .onEvent("INHERIT_CONTACT_DATA")
      .subscribe((event) => {
        console.log("INHERIT_CONTACT_DATA", event);
        this.openConfirmDialog().subscribe((confirmed) => {
          if (confirmed) {
            this.inheritContactData(event.data.docId, event.data.parentId);
          }
        });
      });

    this.subscriptions.push(onEvent);
  }

  private inheritContactData(docId: number, parentId: number) {
    combineLatest([
      this.documentDataService.load(docId),
      this.documentDataService.load(parentId),
    ]).subscribe(([doc, parent]) => {
      doc.address = parent.address;
      doc.contact = parent.contact;
      this.documentService
        .save({ data: doc, isNewDoc: false, isAddress: true })
        .subscribe();
    });
  }

  openConfirmDialog(): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: (<ConfirmDialogData>{
          title: "Kontaktangaben übernehmen",
          message:
            "Achtung! Eventuell vorhandene Kontaktangaben werden durch die übergeordneten ersetzt.",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Angaben übernehmen",
              id: "confirm",
              alignRight: true,
              emphasize: true,
            },
          ],
        }) as ConfirmDialogData,
        hasBackdrop: true,
      })
      .afterClosed()
      .pipe(
        map((response) => {
          return response === "confirm";
        })
      );
  }
}