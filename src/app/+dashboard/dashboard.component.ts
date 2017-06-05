import { Component, OnInit } from '@angular/core';
import {ConfigService} from '../config/config.service';
import {ErrorService} from '../services/error.service';
import {FormularService} from '../services/formular/formular.service';
import {AuthHttp} from 'angular2-jwt';

@Component({
    templateUrl: './dashboard.component.html',
    styles: [`
        .chart { width: 300px; }
        .content { display: inline-block;}
    `]
})
export class DashboardComponent implements OnInit {

    // Pie
    public pieChartLabels: string[] = [];
    public pieChartData: number[] = [];
    public pieChartType = 'pie';

    datasets: any[] = [];

    titleFields: string;

    sideTab = 'myData';


    constructor(private http: AuthHttp, private configService: ConfigService, private errorService: ErrorService,
        private formularService: FormularService) { }

    ngOnInit() {
        this.titleFields = this.formularService.getFieldsNeededForTitle().join(',');
        this.fetchStatistic();
        this.fetchData();
    }

    fetchStatistic() {
        this.http.get( this.configService.backendUrl + 'statistic' ).subscribe(
          data => this.prepareData( data.json() ),
          (err) => this.errorService.handle( err )
        );
    }

    fetchData(query?: string) {
        if (!query) {
          query = '';
        }

        this.http.get(this.configService.backendUrl + 'datasets/find?query=' + query + '&sort=_modified&fields=_id,_profile,_modified,' + this.titleFields)
          .map( data => {
            const json = <any[]>data.json();
            return json.filter(item => item._profile !== 'FOLDER');
          })
          .subscribe( data => {
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

        this.pieChartLabels = Object.keys(data);
        this.pieChartLabels.forEach( key => {
            this.pieChartData.push( data[key] );
        });
    }

    // events
    public chartClicked(e: any): void {
        const index = e.active[0] !== undefined ? e.active[0]._index : undefined;
        if (index !== undefined) {
            this.fetchData('_profile:' + this.pieChartLabels[index]);
        }
    }

    public chartHovered(e: any): void {
        // console.log(e);
    }

    private prepareTableData(data: any[]) {
        return data.map( item => {
            return {
                id: item._id,
                title: this.formularService.getTitle( item._profile, item )
            };
        });
    }
}
