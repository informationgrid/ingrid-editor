import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { MatSort } from "@angular/material/sort";
import { UvpResearchService } from "../uvp-bericht/uvp-research.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { ConfigService } from "../../../../app/services/config/config.service";
import { Router } from "@angular/router";

@UntilDestroy()
@Component({
  selector: "zabbix-report",
  templateUrl: "./zabbix-report.component.html",
  styleUrls: ["./zabbix-report.component.scss"],
})
export class ZabbixReportComponent implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource([]);
  displayedColumns = ["name", "docName", "clock", "settings"];

  constructor(
    uvpResearchService: UvpResearchService,
    private router: Router,
  ) {
    uvpResearchService.getZabbixReport().subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  openDataset(element) {
    const target = ConfigService.catalogId + "/form";
    this.router.navigate([target, { id: element.docUuid }]);
  }
}
