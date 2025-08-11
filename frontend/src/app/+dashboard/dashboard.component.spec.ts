/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { DashboardComponent } from "./dashboard.component";
import { ConfigService } from "../services/config/config.service";
import { of } from "rxjs";
import { recentDocuments } from "../_test-data/documents";
import { ModalService } from "../services/modal/modal.service";
import { FormularService } from "../+form/formular.service";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatDialogModule } from "@angular/material/dialog";
import { DocumentService } from "../services/document/document.service";
import { QuickSearchComponent } from "./quick-search/quick-search.component";
import { ChartComponent } from "./chart/chart.component";
import { DocumentListItemComponent } from "../shared/document-list-item/document-list-item.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { CardBoxComponent } from "../shared/card-box/card-box.component";
import { MatCardModule } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";
import { DateAgoPipe } from "../directives/date-ago.pipe";
import { TranslocoModule } from "@jsverse/transloco";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { MessageService } from "../services/messages/message.service";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { getTranslocoModule } from "../transloco-testing.module";
import { provideLocationMocks } from "@angular/common/testing";
import {
  HttpResourceRef,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { ProfileService } from "../services/profile.service";
import { DashboardService } from "./dashboard.service";
import { DocumentAbstract } from "../store/document/document.model";
import { signal } from "@angular/core";

describe("DashboardComponent", () => {
  let spectator: Spectator<DashboardComponent>;
  const createComponent = createComponentFactory({
    component: DashboardComponent,
    imports: [
      MatDialogModule,
      MatFormFieldModule,
      MatCardModule,
      MatListModule,
      TranslocoModule,
      MatIconTestingModule,
      getTranslocoModule(),
      ChartComponent,
      DocumentListItemComponent,
      CardBoxComponent,
      DateAgoPipe,
    ],
    componentMocks: [QuickSearchComponent],
    providers: [
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
      provideLocationMocks(),
      // provideMatomoTesting(),
    ],
    mocks: [
      ConfigService,
      DocumentService,
      FormularService,
      ModalService,
      MessageService,
      ProfileService,
      DashboardService,
    ],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createComponent({
      providers: [
        // Override the DashboardService mock with specific behavior
        {
          provide: DashboardService,
          useValue: {
            fetchRecentDocs: jasmine
              .createSpy("fetchRecentDocs")
              .and.returnValue({
                value: signal<DocumentAbstract[]>(recentDocuments),
              } as HttpResourceRef<DocumentAbstract[]>),
          },
        },
      ],
    });

    // Set up other mocks after component creation
    const docService = spectator.inject<DocumentService>(DocumentService);
    docService.getStatistic.and.returnValue(
      of({
        statsPerType: new Map(),
        totalNum: 5,
        numDrafts: 3,
        numPublished: 2,
        numAllDrafts: 4,
      }),
    );
  });

  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });

  it("should show last recent documents", () => {
    spectator.detectChanges();

    const recentDocs = spectator.queryAll(
      'ige-card-box[data-cy="card-latest-docs"] .card-title',
    );
    expect(recentDocs[0].textContent.trim()).toEqual("Test Document 1");
    expect(recentDocs[1].textContent.trim()).toEqual("Test Document 2");
    expect(recentDocs[2].textContent.trim()).toEqual("Test Document 3");
  });

  xit("should show number of published documents", () => {
    const numPublishedDocs = spectator.query(".numPublishedDocs");
    expect(numPublishedDocs.textContent).toEqual("2");
  });

  xit("should show number of draft documents", () => {});

  xit('should change URL if shortcut "Neues Dokument" was clicked', () => {});

  xit('should change URL if shortcut "Neue Adresse" was clicked', () => {});

  xit('should change URL if shortcut "Neuer Benutzer" was clicked', () => {});

  xit("should show documents marked as favorite", () => {});

  xit("should open document when selected from recent documents widget", () => {});
});
