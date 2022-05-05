import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent implements OnInit {
  @Input() data: Observable<number[]>;
  @Input() showPercentages: boolean;

  dataMap: Observable<any>;

  total: number;

  strokeDash = [
    [0, 0],
    [0, 0],
  ];

  constructor() {}

  ngOnInit() {
    this.dataMap = this.data.pipe(
      tap((values) => (this.total = this.calculateTotal(values))),
      tap((values) => {
        this.strokeDash = [
          [
            this.calculateAdjustedStrokeDash(values[1]),
            this.calculateStrokeDash(values[0]),
          ],
          [
            this.calculateStrokeDash(values[1]),
            this.calculateAdjustedStrokeDash(values[0]),
          ],
        ];
      }),
      map((values) => {
        return {
          first: values[0] ?? 0,
          second: values[1] ?? 0,
        };
      }),
      untilDestroyed(this)
    );
  }

  private calculateStrokeDash(dataVal) {
    // percentage of total
    return Math.round((100 / this.total) * dataVal);
  }

  private calculateAdjustedStrokeDash(dataVal) {
    let strokeDash = this.calculateStrokeDash(dataVal);
    if (strokeDash > 0 && strokeDash < 100) strokeDash -= 0.75;
    return strokeDash;
  }

  calculateTotal(values: number[]) {
    return values.reduce((acc, val) => acc + val);
  }
}
