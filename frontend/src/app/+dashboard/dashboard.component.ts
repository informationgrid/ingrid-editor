import {Component, OnInit} from '@angular/core';
import {ConfigService, Configuration} from '../services/config/config.service';
import {DocumentService} from '../services/document/document.service';
import {DocumentAbstract} from '../store/document/document.model';
import {Observable} from 'rxjs';
import {SessionQuery} from '../store/session.query';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {NewDocumentPlugin} from '../+form/dialogs/new-doc/new-doc.plugin';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  datasets;

  private configuration: Configuration;
  allDocuments$: Observable<DocumentAbstract[]>;
  recentDocs$: Observable<DocumentAbstract[]>;

  constructor(configService: ConfigService,
              private router: Router,
              private dialog: MatDialog,
              private docService: DocumentService,
              private sessionQuery: SessionQuery) {
    this.configuration = configService.getConfiguration();
  }

  ngOnInit() {
    // this.allDocuments$ = this.docQuery.selectAll();
    this.recentDocs$ = this.sessionQuery.latestDocuments$;
    this.fetchStatistic();
    this.fetchData();
  }

  fetchStatistic() {

  }

  fetchData(query?: string) {

    this.docService.findRecent();

  }

  createNewDocument() {
    console.log('Create new document');
  }

  createNewAddress() {

  }

  createNewUser() {

  }

  openDocument(id: number | string) {
    this.router.navigate(['/form', {id: id}]);
  }

  openAddress(id: number | string) {
    this.router.navigate(['/address', {id: id}]);
  }
}
