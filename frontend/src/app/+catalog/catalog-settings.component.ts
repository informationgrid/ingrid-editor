import { Component, OnInit, ViewChild } from "@angular/core";
import { BehavioursComponent } from "./+behaviours/behaviours.component";
import { FormPluginsService } from "../+form/form-shared/form-plugins.service";
import { Router } from "@angular/router";
import { MatTabNav } from "@angular/material/tabs";
import { SessionService } from "../services/session.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: "ige-catalog-settings",
  templateUrl: "./catalog-settings.component.html",
  styleUrls: ["./catalog-settings.component.scss"],
  providers: [FormPluginsService],
})
export class CatalogSettingsComponent implements OnInit {
  @ViewChild("navigation") tabNav: MatTabNav;
  @ViewChild("behaviours") behaviourComponent: BehavioursComponent;

  activeLink = "general";

  tabs = [
    { label: "Codelisten", path: "codelists" },
    { label: "Formulare", path: "form-behaviours", params: { type: "form" } },
    {
      label: "Katalogverhalten",
      path: "catalog-behaviours",
      params: { type: "catalog" },
    },
    { label: "Indizierung", path: "indexing" },
  ];

  constructor(private router: Router, private sessionService: SessionService) {
    this.activeLink =
      router.getCurrentNavigation()?.finalUrl?.root?.children?.primary
        ?.segments[1]?.path ?? "general";

    // only update tab from route if it was set explicitly in URL
    // otherwise the remembered state from store is used
    const activeTabIndex = this.tabs.findIndex(
      (tab) => tab.path === this.activeLink
    );
    if (activeTabIndex !== 0) {
      this.updateTab(activeTabIndex);
    }
  }

  ngOnInit(): void {
    this.sessionService
      .observeTabChange("catalog")
      .pipe(untilDestroyed(this))
      .subscribe((index) => {
        const tab = this.tabs[index];
        this.activeLink = tab.path;
        tab.params
          ? this.router.navigate(["/catalogs/" + tab.path, tab.params])
          : this.router.navigate(["/catalogs/" + tab.path]);
      });
  }

  updateTab(index: number) {
    this.sessionService.updateCurrentTab("catalog", index);
  }
}
