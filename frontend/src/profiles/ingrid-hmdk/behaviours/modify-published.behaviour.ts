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
import {
  EventData,
  EventResponder,
  EventService,
  IgeEvent,
  IgeEventResultType,
} from "../../../app/services/event/event.service";
import { MatDialog } from "@angular/material/dialog";
import { ResearchService } from "../../../app/+research/research.service";
import { DocumentDataService } from "../../../app/services/document/document-data.service";
import { DocEventsService } from "../../../app/services/event/doc-events.service";
import { TreeQuery } from "../../../app/store/tree/tree.query";
import { Plugin } from "../../../app/+catalog/+behaviours/plugin";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../app/dialogs/confirm/confirm-dialog.component";
import { DocumentAbstract } from "../../../app/store/document/document.model";
import { firstValueFrom } from "rxjs";
import { map } from "rxjs/operators";

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
  researchService = inject(ResearchService);
  documentDataService = inject(DocumentDataService);
  docEvents = inject(DocEventsService);
  treeQuery = inject(TreeQuery);

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

  private handleUpdate() {
    // ignore addresses
    if (this.forAddress) return;
    // if the document is published and if it is published in HmbTG. then show message
    let openedDocument = this.treeQuery.getOpenedDocument();
    if (openedDocument._state !== "P") return;
    this.documentDataService
      .loadPublished(openedDocument._uuid, true)
      .subscribe((published) => {
        if (published?.document.publicationHmbTG)
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

  private buildResponse(isSuccess: boolean): EventData {
    return {
      result: isSuccess ? IgeEventResultType.SUCCESS : IgeEventResultType.FAIL,
      data: isSuccess ? null : "this info comes from profile-ingrid-hmdk.ts",
    };
  }

  private async getHmbTGDocTitles(
    publishedDocs: DocumentAbstract[],
  ): Promise<String[]> {
    return firstValueFrom(
      this.researchService
        .searchBySQL(this.prepareSQL(publishedDocs.map((d) => d._uuid)))
        .pipe(map((response) => response.hits.map((doc) => doc.title))),
    );
  }

  private prepareSQL(uuids: string[]): string {
    return `SELECT document1.*, document_wrapper.category
                 FROM document_wrapper
                        JOIN document document1 ON document_wrapper.uuid = document1.uuid
                 WHERE document1.uuid = ANY(('{<uuids>}'))
                   AND document1.is_latest = true
                   AND document_wrapper.deleted = 0
                   AND jsonb_path_exists(jsonb_strip_nulls(data), '$.publicationHmbTG')
                   AND data->>'publicationHmbTG' = 'true'`.replace(
      "<uuids>",
      uuids.join(", "),
    );
  }
}
