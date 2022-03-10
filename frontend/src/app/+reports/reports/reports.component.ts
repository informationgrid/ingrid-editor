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

@UntilDestroy()
@Component({
  selector: "ige-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent implements OnInit {
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
  facetParameters: any;
  facetViewRefresher = new EventEmitter<void>();
  dataSource = new MatTableDataSource([]);

  form = new FormGroup({
    type: new FormControl("selectDocuments"),
    facets: new FormControl(),
  });
  facets: Facets;

  constructor(
    private docService: DocumentService,
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
    switch (type) {
      case "mCloudDoc":
        return "Fachaufgabe";
      case "TestDoc":
        return "Geodatendienst";
      case "AddressDoc":
        // TODO Temporary: Remove when AddressDocs are more distinguishable.
        if (
          this.facetModel?.addrType?.selectOrganisations &&
          this.facetModel?.addrType?.selectPersons
        )
          return "Freie-Adresse";
        if (this.facetModel?.addrType?.selectOrganisations)
          return "Institution";
        if (this.facetModel?.addrType?.selectPersons) return "Freie-Adresse";
        return "Freie-Adresse";
      default:
        return "";
    }
  }

  getTitle(type: string): string {
    switch (type) {
      case "mCloudDoc":
      case "TestDoc":
        return type.slice(0, -3);
      case "AddressDoc":
        // TODO Temporary: Remove when AddressDocs are more distinguishable.
        if (
          this.facetModel?.addrType?.selectOrganisations &&
          this.facetModel?.addrType?.selectPersons
        )
          return "Adresse";
        if (this.facetModel?.addrType?.selectOrganisations)
          return "Organisation";
        if (this.facetModel?.addrType?.selectPersons) return "Person";
        return "Adresse";
      default:
        return type;
    }
  }

  private async initFacets() {
    return this.researchService
      .getQuickFilter()
      .pipe(tap((filters) => (this.facets = filters)))
      .toPromise();
  }
}
