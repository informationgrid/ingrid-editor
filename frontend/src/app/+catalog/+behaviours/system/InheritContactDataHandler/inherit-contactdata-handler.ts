import { Injectable } from "@angular/core";
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
import { FormUtils } from "../../../../+form/form.utils";
import { FormStateService } from "../../../../+form/form-state.service";
import { AddressTreeQuery } from "../../../../store/address-tree/address-tree.query";
import { FormMenuService } from "../../../../+form/form-menu.service";
import { Plugin2 } from "../../plugin2";

@Injectable()
export class InheritContactDataHandler extends Plugin2 {
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
    private formStateService: FormStateService,
    private documentService: DocumentService,
    private addressTreeQuery: AddressTreeQuery,
    private formMenuService: FormMenuService
  ) {
    super();
  }

  register() {
    super.register();

    const onEvent = this.docEvents
      .onEvent("INHERIT_CONTACT_DATA")
      .subscribe((event) => {
        this.openConfirmDialog().subscribe((confirmed) => {
          if (confirmed) {
            FormUtils.handleDirtyForm(
              this.formStateService.getForm(),
              this.documentService,
              this.dialog,
              this.forAddress
            ).then((handled) => {
              if (handled)
                this.inheritContactData(event.data.docId, event.data.parentId);
            });
          }
        });
      });

    const onDocLoad = this.addressTreeQuery.openedDocument$.subscribe((doc) => {
      // refresh menu item
      this.formMenuService.removeMenuItem("address", "inherit-contact-data");
      if (doc && doc._type !== "FOLDER") {
        const parent = this.addressTreeQuery.getEntity(doc._parent);
        this.formMenuService.addMenuItem("address", {
          title: "Kontaktangaben der übergeordneten Adresse übernehmen",
          name: "inherit-contact-data",
          disabled: !parent || parent._type === "FOLDER",
          action: () =>
            this.docEvents.sendEvent({
              type: "INHERIT_CONTACT_DATA",
              data: { docId: doc.id, parentId: parent.id },
            }),
        });
      }
    });

    this.subscriptions.push(onEvent, onDocLoad);
  }

  unregister() {
    super.unregister();
    this.formMenuService.removeMenuItem("address", "inherit-contact-data");
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
            "Achtung! Eventuell vorhandene Kontaktangaben werden durch die Angaben der übergeordneten Organisation ersetzt.",
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
