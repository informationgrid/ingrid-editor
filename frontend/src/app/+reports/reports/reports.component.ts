import { Component } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ReportsService } from "../reports.service";

@UntilDestroy()
@Component({
  selector: "ige-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent {
  tabs = [];

  constructor(reportsService: ReportsService) {
    reportsService.tabs.pipe(untilDestroyed(this)).subscribe((tabs) => {
      this.tabs = tabs;
    });

    reportsService.updateRouter();
  }
}
