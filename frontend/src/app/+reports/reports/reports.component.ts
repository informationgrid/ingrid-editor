import { Component, OnInit, ViewChild } from "@angular/core";
import { DocumentService } from "../../services/document/document.service";
import { Subject } from "rxjs";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { StatisticResponse } from "../../models/statistic.model";

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
      this.chartDataPublished.next([response.numDrafts, response.numPublished]);
      this.prepareTableData(response);
    });
  }

  prepareTableData(response: StatisticResponse) {
    var data = [];
    console.log(response);
    Object.keys(response.statsPerType).forEach((type) => {
      if (this.ignoredTypes.includes(type)) return;
      const stats = response.statsPerType[type];
      data.push({
        icon: this.getIcon(type) ?? type,
        title: type,
        percentage: stats.totalNum + " / " + response.totalNum,
        count: stats.totalNum,
        published: stats.numPublished,
        working: stats.numDrafts,
      });
    });
    /*    response.statsPerType.forEach((stats, type) => {
      data.push({
        icon: this.getIcon(type) ?? type,
        title: type,
        percentage: stats.totalNum / response.totalNum,
        count: stats.totalNum,
        published: stats.numPublished,
        working: stats.numDrafts,
      });
    });*/

    this.dataSource.data = data;
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
