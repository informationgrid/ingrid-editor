import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SessionService, Tab } from "../services/session.service";

@Component({
  selector: "settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  tabs: Tab[];

  constructor(sessionService: SessionService, activeRoute: ActivatedRoute) {
    this.tabs = sessionService.getTabsFromRoute(activeRoute.snapshot);
  }

  ngOnInit(): void {}
}
