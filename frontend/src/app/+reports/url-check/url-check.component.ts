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
import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { UrlCheckService, UrlInfo, UrlLogResult } from "./url-check.service";
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
import { MatSort, MatSortHeader } from "@angular/material/sort";
import { SelectionModel } from "@angular/cdk/collections";
import { map, tap } from "rxjs/operators";
import { merge, Observable } from "rxjs";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import {
  ListDatasetsDialogComponent,
  ListDatasetsDialogData,
} from "./list-datasets-dialog/list-datasets-dialog.component";
import { MatPaginator } from "@angular/material/paginator";
import { IgeError } from "../../models/ige-error";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfigService } from "../../services/config/config.service";
import { RxStompService } from "../../rx-stomp.service";
import { ExportService } from "../../services/export.service";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";
import { JobHandlerHeaderComponent } from "../../shared/job-handler-header/job-handler-header.component";
import { MatButton, MatIconButton } from "@angular/material/button";
import { ResultTableHeaderComponent } from "../../+research/result-table/result-table-header/result-table-header.component";
import { MatDivider } from "@angular/material/divider";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { MatFormField, MatHint } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { AsyncPipe, DatePipe } from "@angular/common";

@Component({
  selector: "ige-url-check",
  templateUrl: "./url-check.component.html",
  styleUrls: ["./url-check.component.scss"],
  standalone: true,
  imports: [
    PageTemplateComponent,
    JobHandlerHeaderComponent,
    MatButton,
    ResultTableHeaderComponent,
    MatDivider,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatCheckbox,
    MatSortHeader,
    MatIcon,
    MatTooltip,
    MatIconButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    MatFormField,
    MatInput,
    MatHint,
    AsyncPipe,
    DatePipe,
  ],
})
export class UrlCheckComponent implements OnInit {
  private exportService: ExportService = inject(ExportService);

  @ViewChild(MatSort, { static: false })
  set sort(value: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = value;
    }
  }

  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  liveLog: Observable<UrlLogResult> = merge(
    this.urlCheckService.getJobInfo().pipe(map((value) => value.info)),
    this.rxStompService
      .watch(`/topic/jobs/url-check/${ConfigService.catalogId}`)
      .pipe(map((msg) => JSON.parse(msg.body))),
  ).pipe(tap((data: UrlLogResult) => this.handleReport(data)));

  dataSource = new MatTableDataSource<UrlInfo>([]);
  displayedColumns = ["_select_", "status", "url", "count", "datasets"];
  showMore = false;
  selection = new SelectionModel<UrlInfo>(false, []);
  isRunning = false;

  statusCodeText = {
    400: "BadRequest",
    401: "Unauthorized",
    403: "Forbidden",
    404: "NotFound",
    405: "MethodNotAllowed",
    429: "TooManyRequests",
    500: "InternalServerError",
    503: "ServiceUnavailable",
  };
  analyzedUrls: string = "0";

  constructor(
    private router: Router,
    private urlCheckService: UrlCheckService,
    private rxStompService: RxStompService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  start() {
    this.isRunning = true;
    this.urlCheckService.start().subscribe();
  }

  stop() {
    this.urlCheckService.stop().subscribe(() => (this.isRunning = false));
  }

  private handleReport(data: UrlLogResult) {
    if (!data?.report) return;

    data.endTime ? this.setCompletedReport(data) : this.setRunningReport(data);
  }

  private setRunningReport(data: UrlLogResult) {
    this.isRunning = true;
    this.analyzedUrls = `${data.progress}%`;
  }

  private setCompletedReport(data: UrlLogResult) {
    setTimeout(() => (this.isRunning = false), 300);
    this.dataSource.data = data.report?.invalidUrls?.map((url) => ({
      ...url,
      count: url.datasets.length,
      singleDataset: url.datasets.length === 1 ? url.datasets[0].title : null,
    }));
    this.analyzedUrls = `${data.report?.totalUrls}`;
  }

  loadDataset(uuid: string) {
    if (!uuid) return;
    this.router.navigate([`${ConfigService.catalogId}/form`, { id: uuid }]);
  }

  replaceUrl(url: string) {
    this.urlCheckService
      .replaceUrl(this.selection.selected[0], url)
      .pipe(tap((response) => this.updateSelectionInTable(url, response)))
      .subscribe((response) => this.notifyUser(response));
  }

  private updateSelectionInTable(url: string, replaceResponse: any) {
    if (replaceResponse.urlValid) {
      this.dataSource.data = this.dataSource.data.filter(
        (item) => item.url !== this.selection.selected[0].url,
      );
    } else {
      const entry = this.dataSource.data.find(
        (item) => item.url === this.selection.selected[0].url,
      );
      entry.url = url;
      entry.status = replaceResponse.status;
    }
  }

  showDatasets($event: MouseEvent, item: UrlInfo) {
    $event.stopImmediatePropagation();
    this.dialog
      .open(ListDatasetsDialogComponent, {
        maxWidth: 900,
        data: <ListDatasetsDialogData>{
          datasets: item.datasets,
          link: item.url,
        },
      })
      .afterClosed()
      .subscribe((uuid) => this.loadDataset(uuid));
  }

  private notifyUser(response: any) {
    if (response.docsUpdated === 0) {
      throw new IgeError(
        "Die zu ersetzende URL konnte nicht gefunden werden. Bitte starten Sie die Prüfung erneut.",
      );
    } else if (response.urlValid) {
      this.snack.open("Die URL wurde erfolgreich ersetzt");
    } else {
      throw new IgeError("Die Prüfung der URL lieferte einen Fehler");
    }
  }

  downloadTable() {
    const rows: string[][] = [];
    const headerCol = ["Status", "URL", "Datensatz UUID", "Datensatz Titel"];
    rows.push(headerCol);
    rows.push(
      ...this.dataSource.filteredData.flatMap((entry) => {
        return entry.datasets.map((ds) => {
          return [
            this.statusCodeText[entry.status] ?? entry.status,
            entry.url,
            ds.uuid,
            ds.title,
          ];
        });
      }),
    );
    this.exportService.exportCsv(rows, { exportName: "bericht" });
  }
}
