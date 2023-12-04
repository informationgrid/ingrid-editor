import { Component, ViewChild } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { MatSort } from "@angular/material/sort";

@UntilDestroy()
@Component({
  selector: "zabbix-report",
  templateUrl: "./zabbix-report.component.html",
  styleUrls: ["./zabbix-report.component.scss"],
})
export class ZabbixReportComponent {
  @ViewChild(MatSort) sort: MatSort;
  averageDuration: string;

  startDate: string;
  endDate: string;

  facets = {
    addresses: [],
    documents: [
      {
        id: "timeRef",
        label: "Entscheidungsdatum",
        filter: [
          {
            parameters: [],
            implicitFilter: [],
            id: "selectTimespan",
            label: "<group label will be used>",
          },
        ],
        combine: null,
        viewComponent: "TIMESPAN",
      },
    ],
  };
}
