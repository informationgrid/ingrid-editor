import { Component, OnInit, ViewChild } from "@angular/core";
import { SessionService, Tab } from "../services/session.service";
import { MatTabNav } from "@angular/material/tabs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ActivatedRoute, Router } from "@angular/router";
import { filter } from "rxjs/operators";

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
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.tabs = this.sessionService.getTabsFromRoute(
      this.activatedRoute.snapshot
    );

    this.sessionService
      .observeTabChange("import")
      .pipe(
        untilDestroyed(this),
        filter((index) => index !== null)
      )
      .subscribe((index) => {
        const tab = this.tabs[index];
        this.router.navigate(["/importExport/" + tab.path]);
      });
  }

  updateTab(index: number) {
    this.sessionService.updateCurrentTab("import", index);
  }
}
