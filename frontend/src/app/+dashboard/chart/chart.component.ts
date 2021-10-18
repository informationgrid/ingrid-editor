import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { Observable } from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { map, tap } from "rxjs/operators";

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

  @ViewChild("ige-chart", { read: ElementRef }) igeChart: ElementRef;

  dataMap: Observable<any>;

  total: number;

  constructor() {}

  ngOnInit() {
    this.dataMap = this.data.pipe(
      tap((values) => (this.total = this.calculateTotal(values))),
      map((values) => {
        return {
          first: values[0] ?? 0,
          second: values[1] ?? 0,
        };
      }),
      untilDestroyed(this)
    );
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
