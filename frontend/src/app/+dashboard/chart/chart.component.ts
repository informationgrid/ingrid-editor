/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { DecimalPipe } from "@angular/common";

/**
 * This functionality was much inspired by https://stackoverflow.com/questions/48601880/svg-counterclockwise
 */
@UntilDestroy()
@Component({
    selector: "ige-chart",
    templateUrl: "./chart.component.html",
    styleUrls: ["./chart.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DecimalPipe],
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
