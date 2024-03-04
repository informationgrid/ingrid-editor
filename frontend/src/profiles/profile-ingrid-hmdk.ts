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
import { Component, inject, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";
import { InformationSystemDoctypeHMDK } from "./hmdk/doctypes/information-system.doctype";
import { SpecialisedTaskDoctypeHMDK } from "./hmdk/doctypes/specialisedTask.doctype";
import { GeoDatasetDoctypeHMDK } from "./hmdk/doctypes/geo-dataset.doctype";
import { GeoServiceDoctypeHmdk } from "./hmdk/doctypes/geo-service.doctype";
import { ProjectDoctypeHMDK } from "./hmdk/doctypes/project.doctype";
import { DataCollectionDoctypeHMDK } from "./hmdk/doctypes/data-collection.doctype";
import { PublicationDoctypeHMDK } from "./hmdk/doctypes/publication.doctype";
import {
  EventData,
  EventResponder,
  EventService,
  IgeEvent,
  IgeEventResultType,
} from "../app/services/event/event.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../app/dialogs/confirm/confirm-dialog.component";
import { map } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { DocumentAbstract } from "../app/store/document/document.model";
import { firstValueFrom } from "rxjs";
import { ResearchService } from "../app/+research/research.service";

@Component({
  template: "",
})
class InGridHMDKComponent extends InGridComponent {
  specialisedTask = inject(SpecialisedTaskDoctypeHMDK);
  geoDataset = inject(GeoDatasetDoctypeHMDK);
  publication = inject(PublicationDoctypeHMDK);
  geoService = inject(GeoServiceDoctypeHmdk);
  project = inject(ProjectDoctypeHMDK);
  dataCollection = inject(DataCollectionDoctypeHMDK);
  informationSystem = inject(InformationSystemDoctypeHMDK);

  eventService = inject(EventService);
  dialog = inject(MatDialog);
  researchService = inject(ResearchService);

  constructor() {
    super();

    this.eventService
      .respondToEvent(IgeEvent.DELETE)
      .subscribe((eventResponder) => this.handleDeleteEvent(eventResponder));

    this.modifyFormFieldConfiguration();
  }

  private async handleDeleteEvent(eventResponder: EventResponder) {
    let success = false;
    const docs = eventResponder.data as DocumentAbstract[];
    const publishedDocs = docs.filter((doc) => doc._state !== "W");

    const publishedHmbTGTitles = await this.getHmbTGDocTitles(publishedDocs);
    console.log(publishedHmbTGTitles);

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

  private modifyFormFieldConfiguration() {
    [
      this.specialisedTask,
      this.geoDataset,
      this.publication,
      this.geoService,
      this.project,
      this.dataCollection,
      this.informationSystem,
    ].forEach((docType) => {
      // show open data for all types.
      docType.options.hide.openData = false;
      // show open data categories for all types.
      docType.options.dynamicHide.openDataCategories = undefined;
      docType.options.dynamicRequired.openDataCategories =
        "formState.mainModel?.isOpenData || formState.mainModel?.publicationHmbTG";
    });
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

@NgModule({
  declarations: [InGridHMDKComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridHMDKComponent;
  }
}
