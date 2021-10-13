import { Component, EventEmitter, OnInit, ViewChild } from "@angular/core";
import { DocumentService } from "../../services/document/document.service";
import { Subject } from "rxjs";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { StatisticResponse } from "../../models/statistic.model";
import { FacetUpdate } from "../../+research/+facets/facets.component";
import { state } from "@angular/animations";
import { ResearchService } from "../../+research/research.service";

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
  searchClass: "selectDocuments" | "selectAddresses" = "selectDocuments";
  facetViewRefresher = new EventEmitter<void>();
  dataSource = new MatTableDataSource([]);

  updateFilter(info: FacetUpdate) {
    setTimeout(() => {
      return this.researchService
        .searchStatistic(
          { ...info.model, type: this.searchClass },
          info.fieldsWithParameters ?? {}
        )
        .subscribe((result) => this.prepareTableData(result));
    });
  }

  constructor(
    private docService: DocumentService,
    private researchService: ResearchService
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    // this.allDocuments$ = this.docQuery.selectAll();
  }

  fetchStatistic() {
    this.docService.getStatistic().subscribe((response) => {
      // this.chartDataPublished.next([response.numDrafts, response.numPublished]);
      this.prepareTableData(response);
    });
  }

  prepareTableData(response: StatisticResponse) {
    var data = [];
    console.log(response);
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
        return "Adresse";
      default:
        return type;
    }
  }

  updateSearchClass($event) {
    this.facetModel = {};
    this.searchClass = $event;
  }
}
