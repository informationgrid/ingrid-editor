import { Component, OnInit, ViewChild } from "@angular/core";
import { UrlCheckService, UrlInfo, UrlLogResult } from "./url-check.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
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

@Component({
  selector: "ige-url-check",
  templateUrl: "./url-check.component.html",
  styleUrls: ["./url-check.component.scss"],
})
export class UrlCheckComponent implements OnInit {
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
}
