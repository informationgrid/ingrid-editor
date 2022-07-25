import { Component, OnInit, ViewChild } from "@angular/core";
import {
  UrlCheckReport,
  UrlCheckService,
  UrlInfo,
  UrlLogResult,
} from "./url-check.service";
import { RxStompService } from "@stomp/ng2-stompjs";
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

@Component({
  selector: "ige-url-check",
  templateUrl: "./url-check.component.html",
  styleUrls: ["./url-check.component.scss"],
})
export class UrlCheckComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;

  liveLog: Observable<UrlLogResult> = merge(
    this.urlCheckService.getJobInfo().pipe(map((value) => value.info)),
    this.rxStompService
      .watch("/topic/jobs")
      .pipe(map((msg) => JSON.parse(msg.body)))
  ).pipe(tap((data: UrlLogResult) => this.handleReport(data)));

  dataSource = new MatTableDataSource<UrlInfo>([]);
  displayedColumns = ["_select_", "status", "url", "datasets"];
  showMore = false;
  selection = new SelectionModel<UrlCheckReport>(false, []);
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

  constructor(
    private router: Router,
    private urlCheckService: UrlCheckService,
    private rxStompService: RxStompService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  start() {
    this.isRunning = true;
    this.urlCheckService.start().subscribe();
  }

  stop() {
    this.urlCheckService.stop().subscribe(() => (this.isRunning = false));
  }

  private handleReport(data: UrlLogResult) {
    if (data?.endTime) {
      setTimeout(() => (this.isRunning = false), 300);
      this.dataSource.data = data.report.invalidUrls;
      this.toggleActionColumn(data.report.invalidUrls);
    } else this.isRunning = data !== null;
  }

  loadDataset(uuid: string) {
    if (!uuid) return;
    this.router.navigate(["form", { id: uuid }]);
  }

  replaceUrl(url: string) {
    this.urlCheckService
      .replaceUrl(this.selection.selected[0], url)
      .subscribe();
  }

  showDatasets($event: MouseEvent, datasets: any[], url: string) {
    $event.stopImmediatePropagation();
    this.dialog
      .open(ListDatasetsDialogComponent, {
        data: <ListDatasetsDialogData>{
          datasets: datasets,
          link: url,
        },
      })
      .afterClosed()
      .subscribe((uuid) => this.loadDataset(uuid));
  }

  private toggleActionColumn(report: UrlInfo[]) {
    // remove actions column initially
    this.displayedColumns = this.displayedColumns.filter(
      (item) => item !== "action"
    );

    const hasMultipleDatasets = report.some((item) => item.datasets.length > 1);
    if (hasMultipleDatasets) this.displayedColumns.push("action");
  }
}
