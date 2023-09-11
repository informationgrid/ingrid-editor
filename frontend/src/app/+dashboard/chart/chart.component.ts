import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";

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
export class ChartComponent {
  @Input() set data(values: number[]) {
    if (values !== null) this.prepare(values);
  }

  @Input() showPercentages: boolean;

  dataMap: any;

  total: number;

  strokeDash = [
    [0, 0],
    [0, 0],
  ];

  constructor() {}

  prepare(data: number[]) {
    this.dataMap = {
      first: data[0] ?? 0,
      second: data[1] ?? 0,
    };
    this.total = this.calculateTotal(data);

    this.strokeDash = [
      [
        this.calculateAdjustedStrokeDash(data[1]),
        this.calculateStrokeDash(data[0]),
      ],
      [
        this.calculateStrokeDash(data[1]),
        this.calculateAdjustedStrokeDash(data[0]),
      ],
    ];
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
