import { Component, ViewChild } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { MatSort } from "@angular/material/sort";
import { UvpResearchService } from "../uvp-bericht/uvp-research.service";

@UntilDestroy()
@Component({
  selector: "zabbix-report",
  templateUrl: "./zabbix-report.component.html",
  styleUrls: ["./zabbix-report.component.scss"],
})
export class ZabbixReportComponent {
  constructor(private uvpResearchService: UvpResearchService) {
    uvpResearchService.getZabbixReport().subscribe((data) => {
      console.log(data);
    });
  }
}
