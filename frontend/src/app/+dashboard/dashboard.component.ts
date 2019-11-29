import {Component, OnInit} from '@angular/core';
import {ConfigService, Configuration} from '../services/config/config.service';
import {DocumentService} from '../services/document/document.service';
import {DocumentQuery} from '../store/document/document.query';
import {DocumentAbstract} from '../store/document/document.model';
import {Observable} from 'rxjs';
import {ProfileService} from '../services/profile.service';

@Component({
  templateUrl: './dashboard.component.html',
  styles: [`
    .chart {
      width: 500px;
    }

    .content {
      display: inline-block;
    }
  `]
})
export class DashboardComponent implements OnInit {

  data: any = {};
  dataPie = {
    series: [30, 70]
  };
  datasets;

  private configuration: Configuration;
  allDocuments$: Observable<DocumentAbstract[]>;
  recentDocs$: Observable<DocumentAbstract[]>;

  constructor(configService: ConfigService,
              private docService: DocumentService,
              private profileService: ProfileService,
              private docQuery: DocumentQuery) {
    this.configuration = configService.getConfiguration();
  }

  ngOnInit() {
    this.allDocuments$ = this.docQuery.selectAll();
    this.recentDocs$ = this.docQuery.recentDocuments$;
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
}
