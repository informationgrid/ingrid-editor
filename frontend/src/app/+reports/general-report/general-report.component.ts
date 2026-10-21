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
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  EventEmitter,
  inject,
  OnInit,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from "@angular/core";
import { firstValueFrom } from "rxjs";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from "@angular/material/table";
import { StatisticResponse } from "../../models/statistic.model";
import { Facets, ResearchService } from "../../+research/research.service";
import {
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { debounceTime, startWith, tap } from "rxjs/operators";
import { ProfileService } from "../../services/profile.service";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { PageTemplateNoHeaderComponent } from "../../shared/page-template/page-template-no-header.component";
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from "@angular/material/button-toggle";
import { FacetsComponent } from "../../+research/+facets/facets.component";
import { ChartComponent } from "../../+dashboard/chart/chart.component";
import {
  ChartSegment,
  createChartSegments,
  createRightsChartSegments,
  DocumentStateCounts,
  PublicationRightCounts,
} from "../../+dashboard/chart/chart-segments";
import { CardBoxComponent } from "../../shared/card-box/card-box.component";
import { MatIcon } from "@angular/material/icon";
import { CdkMonitorFocus } from "@angular/cdk/a11y";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "ige-general-report",
  templateUrl: "./general-report.component.html",
  styleUrls: ["./general-report.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslocoDirective,
    PageTemplateNoHeaderComponent,
    ReactiveFormsModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    FacetsComponent,
    ChartComponent,
    CardBoxComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIcon,
    MatSortHeader,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    CdkMonitorFocus,
  ],
})
export class GeneralReportComponent implements OnInit, AfterViewInit {
  private destroyRef = inject(DestroyRef);
  private translocoService = inject(TranslocoService);

  readonly sort = viewChild(MatSort);
  ignoredTypes = ["FOLDER"];

  /** the statistic the table analyses: document state or publication right */
  analysis = signal<"status" | "rights">("status");
  displayedColumns = computed(() =>
    this.analysis() === "rights"
      ? [
          "icon",
          "title",
          "percentage",
          "count",
          "internet",
          "intranet",
          "amtsintern",
        ]
      : [
          "icon",
          "title",
          "percentage",
          "count",
          "working",
          "published",
          "publishedWithDraft",
        ],
  );

  private statusCounts = signal<DocumentStateCounts | null>(null);
  private rightCounts = signal<PublicationRightCounts | null>(null);

  /** donut follows the active analysis: document states or publication rights */
  chartSegments = computed<ChartSegment[] | null>(() => {
    const translate = (key: string) => this.translocoService.translate(key);
    if (this.analysis() === "rights") {
      const rights = this.rightCounts();
      return rights ? createRightsChartSegments(rights, translate) : null;
    }
    const status = this.statusCounts();
    return status ? createChartSegments(status, translate) : null;
  });

  facetViewRefresher = new EventEmitter<void>();
  dataSource = new MatTableDataSource([]);

  /** table headers for the document state columns, same wording as the chart labels */
  get docStateLabels() {
    const translate = (key: string) => this.translocoService.translate(key);
    return {
      W: translate("docState.W"),
      P: translate("docState.P"),
      PW: translate("docState.PW"),
    };
  }

  /** table headers for the publication right columns, same wording as the chart labels */
  get tagLabels() {
    const translate = (key: string) => this.translocoService.translate(key);
    return {
      internet: translate("tags.internet"),
      intranet: translate("tags.intranet"),
      amtsintern: translate("tags.amtsintern"),
    };
  }

  form = new UntypedFormGroup({
    type: new UntypedFormControl("selectDocuments"),
    facets: new UntypedFormControl(),
  });
  facets = signal<Facets | null>(null);

  constructor(
    private profileService: ProfileService,
    private researchService: ResearchService,
  ) {}

  async ngOnInit() {
    await this.initFacets();
    this.form.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        startWith(""),
        debounceTime(300),
      )
      .subscribe(() => this.updateFilter());
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort();
  }

  updateFilter() {
    return this.researchService
      .searchStatistic({
        type: this.form.value.type,
        ...this.form.value.facets,
      })
      .subscribe((result) => this.prepareTableData(result));
  }

  prepareTableData(response: StatisticResponse) {
    if (!response?.statsPerType) {
      this.dataSource.data = [];
      this.statusCounts.set(null);
      this.rightCounts.set(null);
      return;
    }
    const types = Object.keys(response.statsPerType);
    const data = [];
    let total = 0;
    let drafts = 0;
    let published = 0;
    let publishedWithDraft = 0;
    let internet = 0;
    let intranet = 0;
    let amtsintern = 0;
    types.forEach((type) => {
      if (this.ignoredTypes.includes(type)) return;
      const stats = response.statsPerType[type];
      total += stats.totalNum;
      drafts += stats.numDrafts;
      published += stats.numPublished;
      publishedWithDraft += stats.numPublishedWithDraft ?? 0;
      internet += stats.numInternet ?? 0;
      intranet += stats.numIntranet ?? 0;
      amtsintern += stats.numAmtsintern ?? 0;
    });
    types.forEach((type) => {
      if (this.ignoredTypes.includes(type)) return;
      const stats = response.statsPerType[type];
      data.push({
        icon: this.getIcon(type) ?? type,
        title: type,
        percentage: total > 0 ? Math.round((stats.totalNum / total) * 100) : 0,
        count: stats.totalNum,
        // document states (3-way split, consistent with the chart)
        working: stats.numDrafts,
        published: stats.numPublished,
        publishedWithDraft: stats.numPublishedWithDraft ?? 0,
        // publication rights
        internet: stats.numInternet ?? 0,
        intranet: stats.numIntranet ?? 0,
        amtsintern: stats.numAmtsintern ?? 0,
      });
    });

    this.dataSource.data = data;
    this.statusCounts.set({
      numDrafts: drafts,
      numPublished: published,
      numPublishedWithDraft: publishedWithDraft,
    });
    this.rightCounts.set({
      numInternet: internet,
      numIntranet: intranet,
      numAmtsintern: amtsintern,
    });
  }

  getIcon(type: string): string {
    return this.profileService.getDoctype(type)?.iconClass ?? "";
  }

  getTitle(type: string): string {
    return (
      this.translocoService.translate(
        `docType.${this.profileService.getDoctype(type)?.id}`,
      ) ?? type
    );
  }

  private async initFacets() {
    return firstValueFrom(
      this.researchService
        .getQuickFilter()
        .pipe(tap((filters) => this.facets.set(filters))),
    );
  }

  /** called by the analysis button toggle; also resets table sorting, since the
   *  sorted column might not exist in the other view */
  setAnalysis(value: "status" | "rights") {
    if (value === this.analysis()) return;
    this.analysis.set(value);
    this.sort()?.sort({ id: "", start: "asc", disableClear: true });
  }

  getAriaLabel(entry) {
    const base = `Typ: ${this.getTitle(entry.title)}, Prozent: ${entry.percentage}%, Anzahl: ${entry.count}`;
    if (this.analysis() === "rights") {
      const labels = this.tagLabels;
      return `${base}, davon ${labels.internet}: ${entry.internet}, ${labels.intranet}: ${entry.intranet}, ${labels.amtsintern}: ${entry.amtsintern}`;
    }
    const labels = this.docStateLabels;
    return `${base}, davon ${labels.W}: ${entry.working}, ${labels.P}: ${entry.published}, ${labels.PW}: ${entry.publishedWithDraft}`;
  }
}
