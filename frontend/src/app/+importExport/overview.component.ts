import { Component, OnInit, ViewChild } from "@angular/core";
import { SessionService, Tab } from "../services/session.service";
import { MatTabNav } from "@angular/material/tabs";
import { UntilDestroy } from "@ngneat/until-destroy";
import { ActivatedRoute, Router } from "@angular/router";

@UntilDestroy()
@Component({
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.scss"],
})
export class OverviewComponent implements OnInit {
  @ViewChild("navigation") tabNav: MatTabNav;

  tabs: Tab[];

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.tabs = this.sessionService.getTabsFromRoute(
      this.activatedRoute.snapshot,
    );

    // only update tab from route if it was set explicitly in URL
    // otherwise the remembered state from store is used
    const currentPath = this.router.parseUrl(this.router.url).root.children
      .primary.segments[2].path;
    const activeTabIndex = this.tabs.findIndex(
      (tab) => tab.path === currentPath,
    );
    if (activeTabIndex !== 0) {
      this.updateTab(activeTabIndex);
    }
  }

  updateTab(index: number) {
    const tabPath = this.sessionService.getTabPaths(
      this.activatedRoute.snapshot,
    );
    this.sessionService.updateCurrentTab("importExport", tabPath[index]);
  }
}
