import {DashboardComponent} from './dashboard.component';

import {RouterTestingModule} from '@angular/router/testing';
import {ChartistModule} from 'ng-chartist';
import {ConfigService} from '../services/config/config.service';
import {of} from 'rxjs';
import {recentDocuments} from '../_test-data/documents';
import {DocumentDataService} from '../services/document/document-data.service';
import {ModalService} from '../services/modal/modal.service';
import {FormularService} from '../+form/formular.service';
import {createComponentFactory, Spectator} from '@ngneat/spectator';


describe('DashboardComponent', () => {
  let spectator: Spectator<DashboardComponent>;
  const createComponent = createComponentFactory({
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
    formService.getTitle.and.callFake((profile, item) => {
      return item.title;
    });

    spectator.detectChanges();

    let recentDocs = spectator.queryAll('.recentDocs li');
    expect(recentDocs[0].textContent.trim()).toEqual('Test Document 1');
    expect(recentDocs[1].textContent.trim()).toEqual('Test Document 2');
    expect(recentDocs[2].textContent.trim()).toEqual('Test Document 3');
  });

  xit('should show number of published documents', () => {
    let numPublishedDocs = spectator.query('.numPublishedDocs');
    expect(numPublishedDocs.textContent).toEqual('2');
  });

  xit('should show number of draft documents', () => {

  });

  xit('should change URL if shortcut "Neues Dokument" was clicked', () => {

  });

  xit('should change URL if shortcut "Neue Adresse" was clicked', () => {

  });

  xit('should change URL if shortcut "Neuer Benutzer" was clicked', () => {

  });

  xit('should show documents marked as favorite', () => {

  });


});
