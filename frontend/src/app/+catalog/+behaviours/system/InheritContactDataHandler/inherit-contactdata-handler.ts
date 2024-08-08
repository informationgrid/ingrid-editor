/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";

@Injectable()
export class InheritContactDataHandler extends Plugin {
  id = "plugin.inherit.contact.data.handler";
  name = "Kontaktangaben der übergeordneten Adresse übernehmen";
  description =
    "Für Personen und Organisationen, die einer anderen Organisation untergeordnet sind, können die Kontakt- und Adressdaten geerbt werden.";
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
    private formMenuService: FormMenuService,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  register() {
    super.register();

    const onEvent = this.docEvents
      .onEvent("INHERIT_CONTACT_DATA")
      .subscribe((event) => {
        this.openConfirmDialog().subscribe(async (confirmed) => {
          if (confirmed) {
            const handled = await FormUtils.handleDirtyForm(
              this.formStateService,
              this.documentService,
              this.dialog,
              this.forAddress,
            );
            if (handled)
              this.inheritContactData(event.data.docId, event.data.parentId);
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
      doc.documentWithMetadata.address = parent.documentWithMetadata.address;
      doc.documentWithMetadata.contact = parent.documentWithMetadata.contact;
      this.documentService
        .save({
          id: docId,
          version: this.formStateService.metadata().version,
          data: doc.documentWithMetadata,
          isNewDoc: false,
          isAddress: true,
        })
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
        }),
      );
  }
}
