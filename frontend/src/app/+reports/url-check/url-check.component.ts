import { Component, OnInit, ViewChild } from "@angular/core";
import { UrlCheckService } from "./url-check.service";
import { map, tap } from "rxjs/operators";
import { RxStompService } from "@stomp/ng2-stompjs";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { SelectionModel } from "@angular/cdk/collections";

@Component({
  selector: "ige-url-check",
  templateUrl: "./url-check.component.html",
  styleUrls: ["./url-check.component.scss"],
})
export class UrlCheckComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;

  liveLog = this.rxStompService
    .watch("/topic/jobs")
    .pipe
    // map((msg) => JSON.parse(msg.body)),
    // tap((data) => (this.indexingIsRunning = !data.endTime))
    ();
  dataSource = new MatTableDataSource([]);
  displayedColumns = ["_select_", "status", "type", "name", "description"];
  showMore = false;
  selection = new SelectionModel<any>(true, []);

  constructor(
    private urlCheckService: UrlCheckService,
    private rxStompService: RxStompService
  ) {}

  ngOnInit(): void {
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
    this.urlCheckService.start().subscribe();
  }
}
