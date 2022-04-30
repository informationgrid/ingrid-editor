import { Component } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { SessionService } from "../../services/session.service";
import { ActivatedRoute } from "@angular/router";

@UntilDestroy()
@Component({
  selector: "ige-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent {
  tabs = [];

  constructor(sessionService: SessionService, activeRoute: ActivatedRoute) {
    this.tabs = sessionService.getTabsFromRoute(activeRoute.snapshot);
  }
}
