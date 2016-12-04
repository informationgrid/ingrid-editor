import { Component, OnInit } from '@angular/core';
import 'chart.js'
import {Http} from "@angular/http";
import {ConfigService} from "../config/config.service";
import {ErrorService} from "../services/error.service";

@Component({
    template: require('./dashboard.component.html')
})
export class DashboardComponent implements OnInit {

    // Pie
    public pieChartLabels:string[] = [];
    public pieChartData:number[] = [];
    public pieChartType:string = 'pie';


    constructor(private http: Http, private configService: ConfigService, private errorService: ErrorService) { }

    ngOnInit() {
        this.fetchData();
    }

    fetchData() {
        this.http.get(this.configService.backendUrl + 'statistic').subscribe(
          data => this.prepareData(data.json()),
          (err) => this.errorService.handle(err)
        );
    }

    prepareData(data: any) {
        this.pieChartLabels = Object.keys(data);
        this.pieChartData = [];
        this.pieChartLabels.forEach( key => {
            this.pieChartData.push( data[key] );
        });
    }

    // events
    public chartClicked(e:any):void {
        // console.log(e.active[0]._index);
    }

    public chartHovered(e:any):void {
        // console.log(e);
    }

}