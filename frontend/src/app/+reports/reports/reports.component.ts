import { Component, EventEmitter, OnInit, ViewChild } from "@angular/core";
import { DocumentService } from "../../services/document/document.service";
import { Subject } from "rxjs";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { StatisticResponse } from "../../models/statistic.model";
import { FacetUpdate } from "../../+research/+facets/facets.component";

@Component({
  selector: "ige-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  chartDataPublished = new Subject<number[]>();
  ignoredTypes = ["FOLDER", "AddressDoc"];
  dataSource = new MatTableDataSource([
    {
      icon: "Geodatensatz",
      title: "Geodatensatz",
      percentage: 80,
      count: 80,
      published: 80,
      working: 80,
    },
    {
      icon: "Geodatendienst",
      title: "Geodatendienst",
      percentage: 80,
      count: 80,
      published: 80,
      working: 80,
    },
    {
      icon: "Fachaufgabe",
      title: "Fachaufgabe",
      percentage: 80,
      count: 80,
      published: 80,
      working: 80,
    },
    {
      icon: "Datensammlung",
      title: "Datensammlung",
      percentage: 80,
      count: 80,
      published: 80,
      working: 80,
    },
    {
      icon: "Informationssystem",
      title: "Informationssystem",
      percentage: 80,
      count: 80,
      published: 80,
      working: 80,
    },
    {
      icon: "Projekt",
      title: "Projekt",
      percentage: 80,
      count: 80,
      published: 80,
      working: 80,
    },
    {
      icon: "Literatur-Dokument",
      title: "Literatur",
      percentage: 80,
      count: 80,
      published: 80,
      working: 80,
    },
  ]);
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
  searchClass: "selectDocuments" | "selectAddresses";
  facetViewRefresher = new EventEmitter<void>();
  updateFilter(info: FacetUpdate) {
    console.log("FacetUpdate", info);
  }
  constructor(private docService: DocumentService) {}

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    // this.allDocuments$ = this.docQuery.selectAll();
    this.fetchStatistic();
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
    this.chartDataPublished.next([filteredDrafts, filteredPublished]);
  }

  getIcon(type: string): string {
    switch (type) {
      case "mCloudDoc":
        return "Fachaufgabe";
      case "TestDoc":
        return "Geodatendienst";
      default:
        return "";
    }
  }
}
