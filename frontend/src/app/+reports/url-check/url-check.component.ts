import { Component, OnInit, ViewChild } from "@angular/core";
import { UrlCheckService, UrlLogResult } from "./url-check.service";
import { RxStompService } from "@stomp/ng2-stompjs";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { SelectionModel } from "@angular/cdk/collections";
import { map, tap } from "rxjs/operators";
import { merge, Observable, Subject } from "rxjs";

@Component({
  selector: "ige-url-check",
  templateUrl: "./url-check.component.html",
  styleUrls: ["./url-check.component.scss"],
})
export class UrlCheckComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;

  lastResult = new Subject();
  liveLog: Observable<UrlLogResult> = merge(
    this.rxStompService
      .watch("/topic/jobs")
      .pipe(map((msg) => JSON.parse(msg.body)))
  ).pipe(
    tap((data: UrlLogResult) => {
      if (data.progress === 100)
        setTimeout(() => (this.isRunning = false), 300);
      else this.isRunning = true;
    })
  );
  dataSource = new MatTableDataSource([]);
  displayedColumns = ["_select_", "status", "type", "name", "description"];
  showMore = false;
  selection = new SelectionModel<any>(true, []);
  isRunning = false;

  constructor(
    private urlCheckService: UrlCheckService,
    private rxStompService: RxStompService
  ) {}

  ngOnInit(): void {
    this.urlCheckService.getJobInfo().subscribe((value) => {
      this.isRunning = value.isRunning;
    });

    this.dataSource.data = [
      {
        status: "200",
        type: "UvpSpatialPlanningProcedureDoc",
        uuid: "13141-4242-242-2453",
        title: "Test-Datensatz",
        url: "https://vcdsvd.fef/fefzzz",
        description: "Testbeschreibung",
      },
      {
        status: "404",
        type: "UvpSpatialPlanningProcedureDoc",
        uuid: "13141-4242-242-2453",
        title: "Test-Datensatz 2",
        url: "https://vcdsvd.fef/fefyyy",
        description: "Testbeschreibung 2",
      },
      {
        status: "401",
        type: "UvpSpatialPlanningProcedureDoc",
        uuid: "13141-4242-242-2453",
        title: "Test-Datensatz 3",
        url: "https://vcdsvd.fef/fefxxx",
        description: "Testbeschreibung 3",
      },
    ];
  }

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
}
