import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ige-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  @Input() data: number[];
  @Input() colors = ['#ff0000', '#00ff00', '#0000ff'];

  private readonly CHART_GAP = 5;

  strokeWidth = 8;
  radius = 60;
  private circumference = 2 * Math.PI * this.radius;
  private chartData = [];
  private angleOffset = -90;
  total: number;

  constructor() { }

  ngOnInit() {

    this.data.forEach((dataVal, index) => {
      const data = {
        degrees: this.angleOffset
      };
      this.chartData.push(data);
      this.angleOffset = this.dataPercentage(dataVal) * 360 + this.angleOffset;
    });
    this.total = this.calculateTotal();

  }


  adjustedCircumference() {
    return this.circumference - this.CHART_GAP;
  }

  calculateStrokeDashOffset(dataVal) {
    const strokeDiff = this.dataPercentage(dataVal) * this.circumference;
    return this.circumference - strokeDiff;
  }

  dataPercentage(dataVal) {
    return dataVal / this.calculateTotal();
  }

  calculateTotal() {
    return this.data.reduce((acc, val) => acc + val);
  }

  returnCircleTransformValue(index: number) {
    return this.chartData[index].degrees;
  }
}
