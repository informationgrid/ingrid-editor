import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

/**
 * This functionality was much inspired by https://css-tricks.com/building-a-donut-chart-with-vue-and-svg/
 * and this codepen: https://codepen.io/soluhmin/pen/rqrBWK?editors=1010
 */
@UntilDestroy()
@Component({
  selector: 'ige-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  @Input() data: Observable<number[]>;
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

    this.data
      .pipe(untilDestroyed(this))
      .subscribe(values => {
      this.total = this.calculateTotal(values);
      values.forEach((dataVal, index) => {
        const data = {
          degrees: this.angleOffset
        };
        this.chartData.push(data);
        this.angleOffset = this.dataPercentage(dataVal) * 360 + this.angleOffset;
      });
    });

  }


  adjustedCircumference() {
    return this.circumference - this.CHART_GAP;
  }

  calculateStrokeDashOffset(dataVal) {
    const strokeDiff = this.dataPercentage(dataVal) * this.circumference;
    return this.circumference - strokeDiff;
  }

  dataPercentage(dataVal) {
    return dataVal / this.total;
  }

  calculateTotal(values: number[]) {
    return values.reduce((acc, val) => acc + val);
  }

  returnCircleTransformValue(index: number) {
    return this.chartData[index].degrees;
  }
}
