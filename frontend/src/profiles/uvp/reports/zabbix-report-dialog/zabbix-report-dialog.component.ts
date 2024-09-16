/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { UvpResearchService } from "../uvp-bericht/uvp-research.service";
import { DatePipe } from "@angular/common";
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
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatPaginator } from "@angular/material/paginator";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import { MatTooltip } from "@angular/material/tooltip";

@Component({
  selector: "zabbix-report-dialog",
  templateUrl: "./zabbix-report-dialog.component.html",
  styleUrls: ["./zabbix-report-dialog.component.scss"],
  standalone: true,
  imports: [
    MatButton,
    MatDialogClose,
    MatDialogContent,
    MatIcon,
    MatDialogActions,
    MatDialogTitle,
    MatIconButton,
    DatePipe,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatMenu,
    MatMenuItem,
    MatPaginator,
    MatProgressSpinner,
    MatRow,
    MatRowDef,
    MatSort,
    MatSortHeader,
    MatTable,
    MatTooltip,
    MatMenuTrigger,
    MatHeaderCellDef,
  ],
})
export class ZabbixReportDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource([]);
  displayedColumns = ["docName", "clock", "resolved", "settings"];
  isLoading = true;

  constructor(
    public dialogRef: MatDialogRef<ZabbixReportDialogComponent>,
    private uvpResearchService: UvpResearchService,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {}

  ngOnInit(): void {
    this.uvpResearchService
      .getZabbixSingleReport(this.data.id)
      .subscribe((res) => {
        this.dataSource.data = res;
        this.isLoading = false;
      });
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}
