import { Component, EventEmitter, OnInit, ViewChild } from "@angular/core";
import { DocumentService } from "../../services/document/document.service";
import { Subject } from "rxjs";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { StatisticResponse } from "../../models/statistic.model";
import { Facets, ResearchService } from "../../+research/research.service";
import { FormControl, FormGroup } from "@angular/forms";
import { debounceTime, tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ProfileService } from "../../services/profile.service";

@UntilDestroy()
@Component({
  selector: "ige-general-report",
  templateUrl: "./general-report.component.html",
  styleUrls: ["./general-report.component.scss"],
})
export class GeneralReportComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  chartDataPublished = new Subject<number[]>();
  ignoredTypes = ["FOLDER"];

  displayedColumns = [
    "icon",
    "title",
    "percentage",
    "count",
    "published",
    "working",
  ];

  facetModel: any;
  facetViewRefresher = new EventEmitter<void>();
  dataSource = new MatTableDataSource([]);

  form = new FormGroup({
    type: new FormControl("selectDocuments"),
    facets: new FormControl(),
  });
  facets: Facets;

  constructor(
    private docService: DocumentService,
    private profileService: ProfileService,
    private researchService: ResearchService
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  async ngOnInit() {
    await this.initFacets();
    this.form.valueChanges
      .pipe(untilDestroyed(this), debounceTime(300))
      .subscribe(() => this.updateFilter());
  }

  fetchStatistic() {
    this.docService.getStatistic().subscribe((response) => {
      // this.chartDataPublished.next([response.numDrafts, response.numPublished]);
      this.prepareTableData(response);
    });
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
    var data = [];
    var filteredTotal = 0;
    var filteredDrafts = 0;
    var filteredPublished = 0;
    Object.keys(response.statsPerType).forEach((type) => {
      if (!this.ignoredTypes.includes(type)) {
        filteredTotal += response.statsPerType[type].totalNum;
        filteredDrafts += response.statsPerType[type].numPublished;
        filteredPublished += response.statsPerType[type].numDrafts;
      }
    });
    Object.keys(response.statsPerType).forEach((type) => {
      if (this.ignoredTypes.includes(type)) return;
      const stats = response.statsPerType[type];
      data.push({
        icon: this.getIcon(type) ?? type,
        title: type,
        percentage:
          filteredTotal > 0
            ? Math.round((stats.totalNum / filteredTotal) * 100)
            : 0,
        count: stats.totalNum,
        published: stats.numPublished,
        working: stats.numDrafts,
      });
    });

    this.dataSource.data = data;
    this.chartDataPublished.next([filteredPublished, filteredDrafts]);
  }

  getIcon(type: string): string {
    return this.profileService.getProfile(type)?.iconClass ?? "";
  }

  getTitle(type: string): string {
    return this.profileService.getProfile(type)?.label ?? type;
  }

  private async initFacets() {
    return this.researchService
      .getQuickFilter()
      .pipe(tap((filters) => (this.facets = filters)))
      .toPromise();
  }
}
