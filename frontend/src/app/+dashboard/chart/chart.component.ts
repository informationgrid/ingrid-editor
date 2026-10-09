/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { DecimalPipe, NgTemplateOutlet } from "@angular/common";
import { ChartSegment, ChartSegmentColor } from "./chart-segments";

/**
 * This functionality was much inspired by https://stackoverflow.com/questions/48601880/svg-counterclockwise
 */

interface ChartSegmentView extends ChartSegment {
  /** resolved color (defaults to "dark") */
  color: ChartSegmentColor;
  /** percentage of the total */
  percent: number;
  /** position along the circle path where the arc starts (0-100); 0 = 12 o'clock */
  offset: number;
  /** arc length along the circle path (0-100), shortened to create a gap between segments */
  dash: number;
  /** angle of the segment center in degrees; 0 = 12 o'clock, 90 = 3 o'clock, 180 = 6 o'clock */
  midAngle: number;
  /** side of the chart on which the label is displayed */
  side: "left" | "right";
}

/** gap between two segments in percent of the circle circumference */
const GAP_BETWEEN_SEGMENTS = 0.75;

@Component({
  selector: "ige-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgTemplateOutlet],
})
export class ChartComponent {
  private static instanceCounter = 0;

  readonly segments = input<ChartSegment[] | null>(null);

  readonly showPercentages = input<boolean>(undefined);

  /**
   * unique id for the hatch pattern to avoid clashes
   * when multiple charts are rendered on the same page
   */
  protected readonly hatchPatternId = `ige-chart-hatch-${ChartComponent.instanceCounter++}`;

  readonly total = computed(() =>
    (this.segments() ?? []).reduce(
      (acc, segment) => acc + (segment.value ?? 0),
      0,
    ),
  );

  /** segments prepared for rendering, in the order they are drawn (clockwise, starting at 12 o'clock) */
  readonly segmentViews = computed(() => this.prepare(this.segments() ?? []));

  /** labels displayed left of the chart, ordered from top (12 o'clock) to bottom (6 o'clock) */
  readonly leftLabels = computed(() =>
    this.segmentViews()
      .filter((segment) => segment.side === "left")
      .sort((a, b) => b.midAngle - a.midAngle),
  );

  /** labels displayed right of the chart, ordered from top (12 o'clock) to bottom (6 o'clock) */
  readonly rightLabels = computed(() =>
    this.segmentViews()
      .filter((segment) => segment.side === "right")
      .sort((a, b) => a.midAngle - b.midAngle),
  );

  private prepare(segments: ChartSegment[]): ChartSegmentView[] {
    const total = this.total();
    const views: ChartSegmentView[] = [];
    let offset = 0;

    for (const segment of segments) {
      const value = segment.value ?? 0;
      const percent = total > 0 ? (100 / total) * value : 0;
      // shorten each arc to create a gap between the segments
      const dash =
        percent < 100 && percent > GAP_BETWEEN_SEGMENTS
          ? percent - GAP_BETWEEN_SEGMENTS
          : percent;
      const midAngle = (offset + percent / 2) * 3.6;

      views.push({
        ...segment,
        color: segment.color ?? "dark",
        percent,
        offset,
        dash,
        midAngle,
        side: midAngle < 180 ? "right" : "left",
      });

      offset += percent;
    }

    return views;
  }
}
