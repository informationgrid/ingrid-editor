import { Component } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { SessionService, Tab } from "../services/session.service";
import { ActivatedRoute, Router } from "@angular/router";

@UntilDestroy()
@Component({
  selector: "ige-research",
  templateUrl: "./research.component.html",
  styleUrls: ["./research.component.scss"],
})
export class ResearchComponent {
  tabs: Tab[];

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private activeRoute: ActivatedRoute,
  ) {
    this.tabs = sessionService.getTabsFromRoute(activeRoute.snapshot);

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
    const tabPaths = this.sessionService.getTabPaths(this.activeRoute.snapshot);
    this.sessionService.updateCurrentTab("research", tabPaths[index]);
  }
}
