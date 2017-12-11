import { Component, OnInit } from '@angular/core';
import { ConfigService, Configuration } from '../services/config.service';
import { ErrorService } from '../services/error.service';
import { FormularService } from '../services/formular/formular.service';
import { HttpClient } from '@angular/common/http';

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
  datasets;

  titleFields: string;

  sideTab = 'myData';
  private configuration: Configuration;


  constructor(private http: HttpClient, configService: ConfigService, private errorService: ErrorService,
              private formularService: FormularService) {
    this.configuration = configService.getConfiguration();
  }

  ngOnInit() {
    this.titleFields = this.formularService.getFieldsNeededForTitle().join(',');
    this.fetchStatistic();
    this.fetchData();
  }

  fetchStatistic() {
    this.http.get<any>(this.configuration.backendUrl + 'statistic').subscribe(
      data => this.prepareData(data),
      (err) => this.errorService.handle(err)
    );
  }

  fetchData(query?: string) {
    if (!query) {
      query = '';
    }

    this.http.get<any[]>(this.configuration.backendUrl + 'datasets?query=' + query +
      '&sort=_modified&fields=_id,_profile,_modified,' + this.titleFields)
      .map(json => {
        return json.filter(item => item._profile !== 'FOLDER');
      })
      .subscribe(data => {
          console.log('Data received: ', data);
          this.datasets = this.prepareTableData(data);
        },
        (err) => this.errorService.handle(err)
      );
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
    newData.datasets = [ {
      data: [],
      backgroundColor: [
        '#FF6384',
        '#4BC0C0',
        '#FFCE56',
        '#E7E9ED',
        '#36A2EB'
      ]
    }];
    newData.labels.forEach(label => {
      newData.datasets[0].data.push(data[label]);
    });

    this.data = newData;
  }

  // events
  public chartClicked(e: any): void {
    console.log( 'Chart clicked:', e );
    // const index = e.active[0] !== undefined ? e.active[0]._index : undefined;
    // if (index !== undefined) {
      // this.fetchData('_profile:' + this.pieChartLabels[index]);
    // }
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }

  private prepareTableData(data: any[]) {
    return data.map(item => {
      return {
        id: item._id,
        title: this.formularService.getTitle(item._profile, item)
      };
    });
  }
}
