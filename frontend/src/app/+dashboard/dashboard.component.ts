import {Component, OnInit} from '@angular/core';
import {ConfigService, Configuration} from '../services/config/config.service';
import {DocumentService} from '../services/document/document.service';
import {DocumentAbstract} from '../store/document/document.model';
import {Observable} from 'rxjs';
import {ProfileService} from '../services/profile.service';
import {IChartistData, IPieChartOptions} from 'chartist';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  data: IChartistData = {
    series: [30, 70]
  };
  chartOptions: IPieChartOptions = {
    donut: true,
    donutWidth: 10,

  };

  datasets;

  private configuration: Configuration;
  allDocuments$: Observable<DocumentAbstract[]>;
  recentDocs$: Observable<DocumentAbstract[]>;

  constructor(configService: ConfigService,
              private docService: DocumentService,
              private profileService: ProfileService) {
    this.configuration = configService.getConfiguration();
  }

  ngOnInit() {
    // this.allDocuments$ = this.docQuery.selectAll();
    // this.recentDocs$ = this.docQuery.recentDocuments$;
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
