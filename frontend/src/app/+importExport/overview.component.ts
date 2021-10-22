import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { SessionService } from "../services/session.service";
import { MatTabNav } from "@angular/material/tabs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Router } from "@angular/router";

@UntilDestroy()
@Component({
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.scss"],
})
export class OverviewComponent implements OnInit, AfterViewInit {
  @ViewChild("navigation") tabNav: MatTabNav;

  activeLink = "import";

  tabs = [
    { label: "Import", path: "import" },
    { label: "Export", path: "export" },
  ];

  constructor(private router: Router, private sessionService: SessionService) {}

  ngOnInit(): void {
    this.sessionService
      .observeTabChange("import")
      .pipe(untilDestroyed(this))
      .subscribe((index) => {
        const tab = this.tabs[index];
        this.activeLink = tab.path;
        this.router.navigate(["/importExport/" + tab.path]);
      });
  }

  ngAfterViewInit(): void {}

  updateTab(index: number) {
    this.sessionService.updateCurrentTab("import", index);
  }
}
