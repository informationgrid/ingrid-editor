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
import { createComponentFactory, Spectator } from "@ngneat/spectator/vitest";
import { ChartComponent } from "./chart.component";
import {
  createChartSegments,
  createRightsChartSegments,
} from "./chart-segments";

const TRANSLATIONS: Record<string, string> = {
  "docState.PW": "In Bearbeitung mit Veröffentlichung",
  "docState.W": "In Bearbeitung",
  "docState.P": "Veröffentlicht",
  "tags.internet": "Internet",
  "tags.intranet": "Intranet",
  "tags.amtsintern": "amtsintern",
};
const translate = (key: string) => TRANSLATIONS[key] ?? key;

describe("ChartComponent", () => {
  let spectator: Spectator<ChartComponent>;
  const createComponent = createComponentFactory(ChartComponent);

  it("should render nothing without segments", () => {
    spectator = createComponent();
    expect(spectator.query("svg")).not.toExist();
  });

  describe("with three segments", () => {
    beforeEach(() => {
      spectator = createComponent({
        props: {
          segments: createChartSegments(
            {
              numDrafts: 30,
              numPublished: 70,
              numPublishedWithDraft: 15,
            },
            translate,
          ),
          showPercentages: true,
        },
      });
    });

    it("should draw one arc per segment, clockwise starting at 12 o'clock", () => {
      const arcs = spectator.queryAll(
        ".circle:not(.circle-3):not(.hatch-base)",
      );
      expect(arcs.length).toBe(3);
      // 15% hatched: starts at the top, shortened by the gap between segments
      expect(arcs[0]).toHaveAttribute("stroke-dasharray", "0, 0, 14.25, 100");
      // 30% orange: starts behind the first segment
      expect(arcs[1]).toHaveAttribute("stroke-dasharray", "0, 15, 29.25, 100");
      // 55% dark: closes the circle at 12 o'clock
      expect(arcs[2]).toHaveAttribute("stroke-dasharray", "0, 45, 54.25, 100");
    });

    it("should show the total in the center", () => {
      expect(spectator.query(".text")).toHaveText("100");
    });

    it("should abbreviate large totals and show the exact count on hover", () => {
      spectator.setInput({
        segments: [
          { value: 6600, label: "Veröffentlicht", color: "dark" },
          { value: 7700, label: "In Bearbeitung", color: "orange" },
        ],
      });
      spectator.detectChanges();

      const center = spectator.query(".text");
      expect(center.textContent).toContain("14 Tsd.");
      expect(center.querySelector("title").textContent).toBe("14300");
      expect(center).toHaveClass("compact-abbrev");

      // 4-digit totals stay exact, in a smaller font
      spectator.setInput({
        segments: [{ value: 1234, label: "Veröffentlicht", color: "dark" }],
      });
      spectator.detectChanges();
      const fourDigits = spectator.query(".text");
      expect(fourDigits.textContent).toContain("1234");
      expect(fourDigits).toHaveClass("compact");
      expect(fourDigits).not.toHaveClass("compact-abbrev");

      // small totals stay exact and unabbreviated
      spectator.setInput({
        segments: [
          { value: 70, label: "Veröffentlicht", color: "dark" },
          { value: 30, label: "In Bearbeitung", color: "orange" },
        ],
      });
      spectator.detectChanges();
      const small = spectator.query(".text");
      expect(small.textContent).toContain("100");
      expect(small).not.toHaveClass("compact");
      expect(small).not.toHaveClass("compact-abbrev");
    });

    it("should place the labels left and right of the chart, ordered from top to bottom", () => {
      const columns = spectator.queryAll(".labels");
      expect(columns.length).toBe(2);

      // dark segment closes the circle (mid angle left of 6 o'clock) -> left column
      const leftBoxes = columns[0].querySelectorAll(".box");
      expect(leftBoxes.length).toBe(1);
      expect(leftBoxes[0]).toHaveText("Veröffentlicht");
      expect(leftBoxes[0].textContent).toContain("55%");

      // hatched and orange segments are on the right half -> right column
      const rightBoxes = columns[1].querySelectorAll(".box");
      expect(rightBoxes.length).toBe(2);
      expect(rightBoxes[0]).toHaveText("In Bearbeitung mit Veröffentlichung");
      expect(rightBoxes[1]).toHaveText("In Bearbeitung");
    });

    it("should color the label of the working segment orange", () => {
      const orangeBox = spectator.query(".box.color-orange");
      expect(orangeBox).toHaveText("In Bearbeitung");
    });
  });

  describe("with two segments", () => {
    beforeEach(() => {
      spectator = createComponent({
        props: {
          segments: [
            { value: 92, label: "Veröffentlicht", color: "dark" },
            { value: 8, label: "In Bearbeitung", color: "orange" },
          ],
        },
      });
    });

    it("should draw the published arc from 12 o'clock and the draft arc closing the circle", () => {
      const arcs = spectator.queryAll(".circle:not(.circle-3)");
      expect(arcs.length).toBe(2);
      expect(arcs[0]).toHaveAttribute("stroke-dasharray", "0, 0, 91.25, 100");
      expect(arcs[1]).toHaveAttribute("stroke-dasharray", "0, 92, 7.25, 100");
    });

    it("should show the published label on the right and the draft label on the left", () => {
      const columns = spectator.queryAll(".labels");
      expect(columns[0].textContent).toContain("In Bearbeitung");
      expect(columns[1].textContent).toContain("Veröffentlicht");
    });

    it("should hide percentages by default", () => {
      const boxes = spectator.queryAll(".box");
      expect(boxes[0].textContent).not.toContain("%");
      expect(boxes[1].textContent).not.toContain("%");
    });
  });

  describe("with publication right segments", () => {
    beforeEach(() => {
      spectator = createComponent({
        props: {
          segments: createRightsChartSegments(
            { numInternet: 55, numIntranet: 30, numAmtsintern: 15 },
            translate,
          ),
          showPercentages: true,
        },
      });
    });

    it("should draw internet, intranet and amtsintern arcs in table order", () => {
      const arcs = spectator.queryAll(
        ".circle:not(.circle-3):not(.hatch-base)",
      );
      expect(arcs.length).toBe(3);
      expect(arcs[0]).toHaveAttribute("stroke-dasharray", "0, 0, 54.25, 100");
      expect(arcs[1]).toHaveAttribute("stroke-dasharray", "0, 55, 29.25, 100");
      expect(arcs[2]).toHaveAttribute("stroke-dasharray", "0, 85, 14.25, 100");
    });

    it("should color the arcs and labels like the tag dots (dark, blue, red)", () => {
      const arcs = spectator.queryAll(
        ".circle:not(.circle-3):not(.hatch-base)",
      );
      expect(arcs[0]).toHaveClass("color-dark");
      expect(arcs[1]).toHaveClass("color-blue");
      expect(arcs[2]).toHaveClass("color-red");

      // label placement is angle-based; assert per color instead of position
      expect(spectator.query(".box.color-dark")).toHaveText("Internet");
      expect(spectator.query(".box.color-blue")).toHaveText("Intranet");
      expect(spectator.query(".box.color-red")).toHaveText("amtsintern");
    });
  });

  it("should handle zero values without crashing", () => {
    spectator = createComponent({
      props: {
        segments: createChartSegments(
          {
            numDrafts: 0,
            numPublished: 0,
            numPublishedWithDraft: 0,
          },
          translate,
        ),
      },
    });
    expect(
      spectator.queryAll(".circle:not(.circle-3):not(.hatch-base)").length,
    ).toBe(3);
    expect(spectator.query(".text")).toHaveText("0");
  });
});

describe("createChartSegments", () => {
  it("should map the three document states to segments", () => {
    const segments = createChartSegments(
      {
        numDrafts: 30,
        numPublished: 70,
        numPublishedWithDraft: 15,
      },
      translate,
    );
    expect(
      segments.map((segment) => [segment.value, segment.label, segment.color]),
    ).toEqual([
      [15, "In Bearbeitung mit Veröffentlichung", "hatched"],
      [30, "In Bearbeitung", "orange"],
      [55, "Veröffentlicht", "dark"],
    ]);
  });

  it("should keep the data-cy attributes for e2e tests", () => {
    const segments = createChartSegments(
      {
        numDrafts: 30,
        numPublished: 70,
        numPublishedWithDraft: 15,
      },
      translate,
    );
    expect(segments.map((segment) => segment.cy)).toEqual([
      undefined,
      "editModeDocument",
      "publishModeDocument",
    ]);
  });

  it("should subtract the published-with-draft documents from the published count", () => {
    const segments = createChartSegments(
      { numDrafts: 30, numPublished: 70 },
      translate,
    );
    expect(segments.map((segment) => segment.value)).toEqual([0, 30, 70]);
  });

  it("should map the publication rights to segments", () => {
    const segments = createRightsChartSegments(
      { numInternet: 55, numIntranet: 30, numAmtsintern: 15 },
      translate,
    );
    expect(
      segments.map((segment) => [segment.value, segment.label, segment.color]),
    ).toEqual([
      [55, "Internet", "dark"],
      [30, "Intranet", "blue"],
      [15, "amtsintern", "red"],
    ]);
  });
});
