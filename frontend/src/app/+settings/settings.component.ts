import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService, Tab } from "../services/session.service";

@Component({
  selector: "settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  activeLink = "general";

  tabs: Tab[];

  constructor(
    router: Router,
    private sessionService: SessionService,
    private activeRoute: ActivatedRoute,
  ) {
    this.tabs = sessionService.getTabsFromRoute(activeRoute.snapshot);
  }

  ngOnInit(): void {}
}
