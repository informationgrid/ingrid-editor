import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

/**
 * This functionality was much inspired by https://stackoverflow.com/questions/48601880/svg-counterclockwise
 */
@UntilDestroy()
@Component({
  selector: "ige-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.scss"],
})
export class ChartComponent implements OnInit {
  @Input() data: Observable<number[]>;
  @Input() showPercentages: boolean;

  total: number;

  constructor() {}

  ngOnInit() {
    this.data.pipe(untilDestroyed(this)).subscribe((values) => {
      this.total = this.calculateTotal(values);
    });
  }

  calculateStrokeDash(dataVal) {
    // percentage of total
    return Math.round((100 / this.total) * dataVal);
  }

  calculateAdjustedStrokeDash(dataVal) {
    return this.calculateStrokeDash(dataVal) - 0.75;
  }

  calculateTotal(values: number[]) {
    return values.reduce((acc, val) => acc + val);
  }
}
