import { Component, OnInit } from '@angular/core';
import {Http} from '@angular/http';
import {ConfigService} from '../config/config.service';
import {ErrorService} from '../services/error.service';
import {FormularService} from '../services/formular/formular.service';
import {AuthHttp} from 'angular2-jwt';

@Component({
    template: require('./dashboard.component.html')
})
export class DashboardComponent implements OnInit {

    // Pie
    public pieChartLabels: string[] = [];
    public pieChartData: number[] = [];
    public pieChartType: string = 'pie';

    datasets: any[] = [];

    titleFields: string;


    constructor(private http: AuthHttp, private configService: ConfigService, private errorService: ErrorService,
        private formularService: FormularService) { }

    ngOnInit() {
        this.titleFields = this.formularService.getFieldsNeededForTitle().join(',');
        this.fetchData();
    }

    fetchData() {
        this.http.get(this.configService.backendUrl + 'statistic').subscribe(
          data => this.prepareData(data.json()),
          (err) => this.errorService.handle(err)
        );

        this.http.get(this.configService.backendUrl + 'datasets/find?query=&sort=_modified&fields=_id,_profile,_modified,' + this.titleFields)
          .map( data => {
            let json = <any[]>data.json();
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
        if (data.FOLDER) delete data.FOLDER;

        this.pieChartLabels = Object.keys(data);
        this.pieChartData = [];
        this.pieChartLabels.forEach( key => {
            this.pieChartData.push( data[key] );
        });
    }

    // events
    public chartClicked(e: any): void {
        // console.log(e.active[0]._index);
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