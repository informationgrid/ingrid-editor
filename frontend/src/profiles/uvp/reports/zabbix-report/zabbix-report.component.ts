import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { UvpResearchService } from "../uvp-bericht/uvp-research.service";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { ConfigService } from "../../../../app/services/config/config.service";
import { Router } from "@angular/router";
import { SharedModule } from "../../../../app/shared/shared.module";
import { PageTemplateModule } from "../../../../app/shared/page-template/page-template.module";
import { DatePipe } from "@angular/common";
import { SharedPipesModule } from "../../../../app/directives/shared-pipes.module";
import { MatMenuModule } from "@angular/material/menu";

@UntilDestroy()
@Component({
  selector: "zabbix-report",
  templateUrl: "./zabbix-report.component.html",
  styleUrls: ["./zabbix-report.component.scss"],
  standalone: true,
  imports: [
    SharedModule,
    PageTemplateModule,
    DatePipe,
    SharedPipesModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
  ],
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
