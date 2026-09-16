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
import {
  EventData,
  EventResponder,
  EventService,
  IgeEvent,
  IgeEventResultType,
} from "../../../app/services/event/event.service";
import { MatDialog } from "@angular/material/dialog";
import { DocumentDataService } from "../../../app/services/document/document-data.service";
import { DocEventsService } from "../../../app/services/event/doc-events.service";
import { Plugin } from "../../../app/+catalog/+behaviours/plugin";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../app/dialogs/confirm/confirm-dialog.component";
import { DocumentAbstract } from "../../../app/store/document/document.model";
import { firstValueFrom } from "rxjs";
import { GeneralStore } from "../../../app/store/general.store";
import { HmdkDocumentSearchService } from "../hmdk-document-search.service";

@Injectable({ providedIn: "root" })
export class ModifyPublishedBehaviour extends Plugin {
  id = "plugin.hmdk.modify-published";
  name = "HMDK Datensatzbearbeitungslogik";
  description =
    "Logik für die Bearbeitung von veröffentlichten Datensätzen nach HmbTG im HMDK-Profil";
  defaultActive = true;
  hide = true;

  eventService = inject(EventService);
  dialog = inject(MatDialog);
  documentSearchService = inject(HmdkDocumentSearchService);
  documentDataService = inject(DocumentDataService);
  docEvents = inject(DocEventsService);
  generalStore = inject(GeneralStore);

  constructor() {
    super();
  }

  registerForm() {
    super.registerForm();

    this.formSubscriptions.push(
      this.eventService
        .respondToEvent(IgeEvent.DELETE)
        .subscribe((eventResponder) => this.handleDeleteEvent(eventResponder)),
      this.docEvents.onEvent("SAVE").subscribe(() => this.handleUpdate()),
    );
  }

  /**
   * Handles the update event for published documents.
   *
   * Shows an information dialog when a published document with HmbTG publication
   * is being updated, informing the user that changes will create a new version
   * in the transparency portal while the old version remains published.
   */
  private handleUpdate() {
    // ignore addresses
    if (this.forAddress()) return;
    // if the document is published and if it is published in HmbTG. then show message
    let openedDocument = this.generalStore.getOpenedDocument(this.forAddress());
    if (openedDocument._state !== "P") return;
    this.documentDataService
      .loadPublished(openedDocument._uuid, true)
      .subscribe((published) => {
        if (published?.document.properties?.publicationHmbTG)
          this.dialog
            .open(ConfirmDialogComponent, {
              data: {
                title: "Information",
                message:
                  "Dieser Datensatz ist bereits nach dem HmbTG im Hamburger Transparenzportal veröffentlicht. Eine Änderung in der Metadatenbeschreibung führt zu einer neuen Version im Transparenzportal. Die alte Metadatenbeschreibung bleibt weiterhin im Transparenzportal veröffentlicht.",
                buttons: [{ text: "Ok", alignRight: true, emphasize: true }],
              } as ConfirmDialogData,
            })
            .afterClosed()
            .subscribe();
      });
  }

  /**
   * Handles the delete event for published documents.
   *
   * When documents are being deleted, checks if any are published with HmbTG publication.
   * If so, shows a confirmation dialog informing the user that these documents will remain
   * published in the transparency portal for 10 years even after deletion from HMDK.
   *
   * @param eventResponder The event responder containing the documents to delete
   */
  private async handleDeleteEvent(eventResponder: EventResponder) {
    let success = false;
    const docs = eventResponder.data as DocumentAbstract[];
    const publishedDocs = docs.filter((doc) => doc._state !== "W");

    const publishedHmbTGTitles = await this.getHmbTGDocTitles(publishedDocs);

    if (publishedHmbTGTitles.length) {
      this.dialog
        .open(ConfirmDialogComponent, {
          data: {
            title: "Löschen",
            message:
              "Folgende Datensätze sind bereits nach dem HmbTG im Hamburger Transparenzportal veröffentlicht und bleiben auch bei der Löschung der Metadatenbeschreibung aus dem HMDK bis zum Ablauf der 10 Jahre im Transparenzportal veröffentlicht.",
            list: publishedHmbTGTitles,
          } as ConfirmDialogData,
        })
        .afterClosed()
        .subscribe((handled) => {
          const responseData = this.buildResponse(handled);
          eventResponder.eventResponseHandler(responseData);
        });
    } else {
      success = true;
      const responseData = this.buildResponse(success);
      eventResponder.eventResponseHandler(responseData);
    }
  }

  /**
   * Builds the response data for the event.
   *
   * @param isSuccess Whether the operation was successful
   * @returns EventData with the appropriate result type
   */
  private buildResponse(isSuccess: boolean): EventData {
    return {
      result: isSuccess ? IgeEventResultType.SUCCESS : IgeEventResultType.FAIL,
      data: isSuccess ? null : "this info comes from profile-ingrid-hmdk.ts",
    };
  }

  /**
   * Retrieves titles of documents that have HmbTG publication.
   *
   * @param publishedDocs Array of published documents
   * @returns Promise resolving to array of document titles
   */
  private async getHmbTGDocTitles(
    publishedDocs: DocumentAbstract[],
  ): Promise<string[]> {
    return firstValueFrom(
      this.documentSearchService.getHmbtgDocumentTitles(
        publishedDocs.map((d) => d._uuid),
      ),
    );
  }
}
