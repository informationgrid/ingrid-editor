/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
