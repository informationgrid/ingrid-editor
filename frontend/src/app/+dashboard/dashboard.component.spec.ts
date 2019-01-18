import {DashboardComponent} from "./dashboard.component";

import {createTestComponentFactory, Spectator} from '@netbasal/spectator';
import {RouterTestingModule} from "@angular/router/testing";
import {ChartistModule} from "ng-chartist";
import {ConfigService} from "../services/config/config.service";
import {FormularService} from "../services/formular/formular.service";
import {of} from "rxjs";
import {recentDocuments} from "../_test-data/documents";
import {DocumentDataService} from "../services/document/document-data.service";
import {ModalService} from "../services/modal/modal.service";


describe('DashboardComponent', () => {
  let spectator: Spectator<DashboardComponent>;
  const createComponent = createTestComponentFactory({
    component: DashboardComponent,
    imports: [ChartistModule, RouterTestingModule],
    mocks: [ConfigService, DocumentDataService, FormularService, ModalService],
    detectChanges: false
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should show last recent documents', () => {
    let dataService = spectator.get<DocumentDataService>(DocumentDataService);
    dataService.find.and.returnValue(of(recentDocuments));
    let formService = spectator.get<FormularService>(FormularService);
    formService.getTitle.and.callFake( (profile, item) => {
      return item.title;
    });

    spectator.detectChanges();

    // expect(docService).toHaveBeenCalled();
    // expect(docService).toHaveBeenCalledTimes(1);

    let recentDocs = spectator.queryAll('.recentDocs li');
    expect(recentDocs[0].textContent.trim()).toEqual('Test Document 1');
    expect(recentDocs[1].textContent.trim()).toEqual('Test Document 2');
    expect(recentDocs[2].textContent.trim()).toEqual('Test Document 3');
  });
});
