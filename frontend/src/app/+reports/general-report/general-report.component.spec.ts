/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
import { of } from "rxjs";
import { MatSort } from "@angular/material/sort";
import { MatIconRegistry } from "@angular/material/icon";
import { FakeMatIconRegistry } from "@angular/material/icon/testing";
import { GeneralReportComponent } from "./general-report.component";
import { ResearchService } from "../../+research/research.service";
import { ProfileService } from "../../services/profile.service";
import { LeafletService } from "../../formly/types/map/leaflet.service";
import { CodelistService } from "../../services/codelist/codelist.service";
import { BehaviourService } from "../../services/behavior/behaviour.service";
import { StatisticResponse } from "../../models/statistic.model";
import { getTranslocoModule } from "../../transloco-testing.module";

/**
 * GeoDataset: 1 published, 1 published with working version.
 * GeoService: 1 draft (intranet).
 * FOLDER: ignored by the report.
 *
 * numPublished counts only documents in state "P", not "PW".
 */
const RESPONSE: StatisticResponse = {
  totalNum: 4,
  numPublished: 2,
  numDrafts: 1,
  numPublishedWithDraft: 1,
  numInternet: 2,
  numIntranet: 2,
  numAmtsintern: 0,
  statsPerType: {
    InGridGeoDataset: {
      totalNum: 2,
      numPublished: 1,
      numDrafts: 0,
      numPublishedWithDraft: 1,
      numInternet: 1,
      numIntranet: 1,
      numAmtsintern: 0,
      statsPerType: null,
    },
    InGridGeoService: {
      totalNum: 1,
      numPublished: 0,
      numDrafts: 1,
      numPublishedWithDraft: 0,
      numInternet: 0,
      numIntranet: 1,
      numAmtsintern: 0,
      statsPerType: null,
    },
    FOLDER: {
      totalNum: 1,
      numPublished: 1,
      numDrafts: 0,
      numPublishedWithDraft: 0,
      numInternet: 1,
      numIntranet: 0,
      numAmtsintern: 0,
      statsPerType: null,
    },
  },
} as unknown as StatisticResponse;

describe("GeneralReportComponent", () => {
  let spectator: Spectator<GeneralReportComponent>;
  const createComponent = createComponentFactory({
    component: GeneralReportComponent,
    imports: [getTranslocoModule()],
    providers: [
      { provide: MatIconRegistry, useClass: FakeMatIconRegistry },
      {
        provide: ResearchService,
        useValue: {
          searchStatistic: () => of(RESPONSE),
          getQuickFilter: () => of({ documents: [], addresses: [] }),
        },
      },
      {
        provide: ProfileService,
        useValue: { getDoctype: () => ({ id: "test", iconClass: "icon" }) },
      },
      { provide: LeafletService, useValue: {} },
      { provide: CodelistService, useValue: {} },
      { provide: BehaviourService, useValue: {} },
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    // the form emits debounced on init; feed the data deterministically instead
    spectator.component.prepareTableData(RESPONSE);
    spectator.detectChanges();
  });

  const toggleAnalysis = (target: "status" | "rights") => {
    const toggles = spectator.queryAll("mat-button-toggle");
    const toggle = toggles.find((t) =>
      t.textContent.includes(
        target === "rights"
          ? "Veröffentlichungsrecht"
          : "Veröffentlichungsstatus",
      ),
    );
    spectator.click(toggle.querySelector("button"));
  };

  const headerTexts = () =>
    spectator
      .queryAll("ige-card-box th")
      .map((th) => th.textContent.trim())
      .filter((text) => text.length > 0);

  it("should aggregate the statistic and ignore folders by default", () => {
    const rows = spectator.queryAll("ige-card-box tbody tr");
    expect(rows.length).toBe(2); // FOLDER is excluded

    const values = spectator.component.dataSource.data;
    expect(values.map((row) => row.title)).toEqual([
      "InGridGeoDataset",
      "InGridGeoService",
    ]);
    expect(values[0]).toMatchObject({
      percentage: 67,
      count: 2,
      working: 0,
      published: 1,
      publishedWithDraft: 1,
      internet: 1,
      intranet: 1,
      amtsintern: 0,
    });
    expect(values[1]).toMatchObject({
      percentage: 33,
      count: 1,
      working: 1,
      published: 0,
      publishedWithDraft: 0,
      internet: 0,
      intranet: 1,
      amtsintern: 0,
    });
  });

  it("should show the status analysis by default, matching the chart labels", () => {
    expect(headerTexts()).toEqual([
      "Typ",
      "Prozent",
      "Anzahl",
      "In Bearbeitung",
      "Veröffentlicht",
      "In Bearbeitung mit Veröffentlichung",
    ]);
    expect(
      spectator.component.chartSegments().map((s) => [s.value, s.label]),
    ).toEqual([
      [1, "In Bearbeitung mit Veröffentlichung"],
      [1, "In Bearbeitung"],
      [1, "Veröffentlicht"],
    ]);
  });

  it("should switch table columns and chart segments with the analysis toggle", () => {
    toggleAnalysis("rights");

    expect(spectator.component.analysis()).toBe("rights");
    expect(headerTexts()).toEqual([
      "Typ",
      "Prozent",
      "Anzahl",
      "Internet",
      "Intranet",
      "amtsintern",
    ]);
    expect(
      spectator.component.chartSegments().map((s) => [s.value, s.label]),
    ).toEqual([
      [1, "Internet"],
      [2, "Intranet"],
      [0, "amtsintern"],
    ]);

    toggleAnalysis("status");
    expect(headerTexts()).toContain("Veröffentlicht");
    expect(headerTexts()).not.toContain("amtsintern");
  });

  it("should reset the table sorting when switching the analysis", () => {
    toggleAnalysis("rights");

    const intranetHeader = spectator
      .queryAll("th")
      .find((th) => th.textContent.includes("Intranet"));
    spectator.click(intranetHeader.querySelector(".mat-sort-header-container"));
    expect(spectator.query(MatSort).active).toBe("intranet");

    toggleAnalysis("status");
    expect(spectator.query(MatSort).active).toBe("");
  });

  it("should connect the sort to data source and sort rows when clicking a column header", () => {
    expect(spectator.component.dataSource.sort).toBe(
      spectator.component.sort(),
    );

    // Initial order: InGridGeoDataset (count: 2), InGridGeoService (count: 1)
    const countCells = () =>
      spectator
        .queryAll("ige-card-box tbody tr td.mat-column-count")
        .map((td) => td.textContent.trim());

    expect(countCells()).toEqual(["2", "1"]);

    const countHeader = spectator
      .queryAll("th")
      .find((th) => th.textContent.includes("Anzahl"));
    spectator.click(countHeader.querySelector(".mat-sort-header-container"));
    spectator.detectChanges();

    // After ascending sort on count: InGridGeoService (1), InGridGeoDataset (2)
    expect(countCells()).toEqual(["1", "2"]);

    // After descending sort on count: InGridGeoDataset (2), InGridGeoService (1)
    spectator.click(countHeader.querySelector(".mat-sort-header-container"));
    spectator.detectChanges();

    expect(countCells()).toEqual(["2", "1"]);
  });

  it("should handle null or undefined statsPerType gracefully", () => {
    spectator.component.prepareTableData(null as unknown as StatisticResponse);
    expect(spectator.component.dataSource.data).toEqual([]);
    expect(spectator.component.chartSegments()).toBeNull();

    spectator.component.prepareTableData({
      statsPerType: null,
    } as unknown as StatisticResponse);
    expect(spectator.component.dataSource.data).toEqual([]);
    expect(spectator.component.chartSegments()).toBeNull();
  });

  it("should build mode-aware aria labels", () => {
    const row = spectator.component.dataSource.data[0];

    expect(spectator.component.getAriaLabel(row)).toBe(
      "Typ: docType.test, Prozent: 67%, Anzahl: 2, davon In Bearbeitung: 0, " +
        "Veröffentlicht: 1, In Bearbeitung mit Veröffentlichung: 1",
    );

    spectator.component.analysis.set("rights");
    expect(spectator.component.getAriaLabel(row)).toBe(
      "Typ: docType.test, Prozent: 67%, Anzahl: 2, davon Internet: 1, " +
        "Intranet: 1, amtsintern: 0",
    );
  });
});
