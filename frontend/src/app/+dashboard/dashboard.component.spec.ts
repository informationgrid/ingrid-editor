import { DashboardComponent } from "./dashboard.component";

import { RouterTestingModule } from "@angular/router/testing";
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
import { SessionStore } from "../store/session.store";
import { DateAgoPipe } from "../directives/date-ago.pipe";
import { TranslocoModule } from "@ngneat/transloco";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { DashboardModule } from "./dashboard.module";
import { MessageService } from "../services/messages/message.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { getTranslocoModule } from "../transloco-testing.module";

describe("DashboardComponent", () => {
  let spectator: Spectator<DashboardComponent>;
  const createComponent = createComponentFactory({
    component: DashboardComponent,
    imports: [
      RouterTestingModule,
      MatDialogModule,
      MatFormFieldModule,
      MatCardModule,
      MatListModule,
      TranslocoModule,
      MatIconTestingModule,
      DashboardModule,
      HttpClientTestingModule,
      getTranslocoModule(),
    ],
    declarations: [
      ChartComponent,
      DocumentListItemComponent,
      CardBoxComponent,
      DateAgoPipe,
    ],
    componentMocks: [QuickSearchComponent],
    providers: [],
    mocks: [
      ConfigService,
      DocumentService,
      FormularService,
      ModalService,
      MessageService,
    ],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createComponent();
    const dataService = spectator.inject<DocumentService>(DocumentService);
    dataService.getStatistic.and.returnValue(
      of({ totalNum: 5, numDrafts: 3, numPublished: 2 })
    );
  });

  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });

  it("should show last recent documents", () => {
    const sessionStore = spectator.inject(SessionStore);
    const dataService = spectator.inject<DocumentService>(DocumentService);
    dataService.findRecent.and.callFake(() => {
      sessionStore.update({ latestDocuments: recentDocuments });
    });
    // const formService = spectator.inject<FormularService>(FormularService);

    spectator.detectChanges();

    const recentDocs = spectator.queryAll(
      'ige-card-box[data-cy="card-latest-docs"] .card-title'
    );
    console.log(recentDocs.length);
    console.log(recentDocs[0]);
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
