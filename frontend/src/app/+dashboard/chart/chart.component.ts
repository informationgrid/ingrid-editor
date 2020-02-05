import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ige-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  @Input() data: number[];

  percentage: number;
  total: number;

  constructor() { }

  ngOnInit() {
    this.total = this.data.reduce( (prev, curr) => prev + curr);
    this.percentage = (this.data[0] / this.total) * 100;
  }

}
