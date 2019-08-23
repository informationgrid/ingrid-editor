import {Component, OnInit} from '@angular/core';
import {ConfigService, Configuration} from '../services/config/config.service';
import {FormularService} from '../services/formular/formular.service';
import {DocumentService} from "../services/document/document.service";
import {ProfileQuery} from "../store/profile/profile.query";
import {DocumentQuery} from "../store/document/document.query";
import {DocumentAbstract} from "../store/document/document.model";
import {Observable} from "rxjs";
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

  titleFields: string;

  sideTab = 'myData';
  private configuration: Configuration;
  allDocuments$: Observable<DocumentAbstract[]>;
  recentDocs$: Observable<DocumentAbstract[]>;

  constructor(configService: ConfigService,
              private docService: DocumentService,
              private profileService: ProfileService,
              private docQuery: DocumentQuery,
              private formularService: FormularService) {
    this.configuration = configService.getConfiguration();
  }

  ngOnInit() {
    this.profileService.initialized.then( () => {
      this.titleFields = this.formularService.getFieldsNeededForTitle().join(',');
    } );

    this.allDocuments$ = this.docQuery.selectAll();
    this.recentDocs$ = this.docQuery.recentDocuments$;
    this.fetchStatistic();
    this.fetchData();
  }

  fetchStatistic() {
    /*this.http.get<any>(this.configuration.backendUrl + 'statistic').subscribe(
      data => this.prepareData(data)
      // (err) => this.errorService.handle(err)
    );*/
  }

  fetchData(query?: string) {
    if (!query) {
      query = '';
    }

    this.docService.findRecent();
      /*.pipe(
        map(json => {
          let noFolderDocs = json.filter(item => item && item._profile !== 'FOLDER');
          // return this.prepareTableData(noFolderDocs);
          return noFolderDocs;
        })
      );*/
  }

  prepareData(data: any) {
    // do not show folders
    if (data.FOLDER) {
      delete data.FOLDER;
    }
    if (data['@type'] !== undefined) {
      delete data['@type'];
    }
    if (data['@version'] !== undefined) {
      delete data['@version'];
    }

    const newData: any = {};
    newData.labels = Object.keys(data);
    newData.series = [[]];
    newData.labels.forEach(label => {
      newData.series[0].push(data[label]);
    });

    this.data = newData;
  }

  /*private prepareTableData(data: any[]): DocumentAbstract[] {
    return data.map(item => {
      return {
        _id: item._id,
        _profile: "",
        icon: "",
        _children: null,
        _hasChildren: false,
        title: this.formularService.getTitle(item._profile, item)
      };
    });
  }*/
  createNewDocument() {
    console.log("Create new document");
  }

  createNewAddress() {

  }

  createNewUser() {

  }
}
