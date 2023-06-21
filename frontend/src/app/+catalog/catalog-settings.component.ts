import { Component, OnInit, ViewChild } from "@angular/core";
import { BehavioursComponent } from "./+behaviours/behaviours.component";
import { ActivatedRoute, Router } from "@angular/router";
import { MatTabNav } from "@angular/material/tabs";
import { SessionService } from "../services/session.service";
import { UntilDestroy } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: "ige-catalog-settings",
  templateUrl: "./catalog-settings.component.html",
  styleUrls: ["./catalog-settings.component.scss"],
})
export class CatalogSettingsComponent implements OnInit {
  @ViewChild("navigation") tabNav: MatTabNav;
  @ViewChild("behaviours") behaviourComponent: BehavioursComponent;

  tabs = [
    { label: "Codelisten", path: "codelists" },
    { label: "Formulare", path: "form-behaviours", params: { type: "form" } },
    {
      label: "Katalogverhalten",
      path: "catalog-behaviours",
      params: { type: "catalog" },
    },
    { label: "Indizierung", path: "indexing" },
    { label: "Konfiguration", path: "config" },
  ];

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private sessionService: SessionService
  ) {
    // only update tab from route if it was set explicitly in URL
    // otherwise the remembered state from store is used
    const currentPath = this.router.parseUrl(this.router.url).root.children
      .primary.segments[2].path;
    const activeTabIndex = this.tabs.findIndex(
      (tab) => tab.path === currentPath
    );
    if (activeTabIndex !== 0) {
      this.updateTab(activeTabIndex);
    }
  }

  ngOnInit(): void {}

  updateTab(index: number) {
    const tabPaths = this.sessionService.getTabPaths(this.activeRoute.snapshot);
    const params = this.tabs.find(
      (item) => item.path === tabPaths[index]
    ).params;

    this.sessionService.updateCurrentTab(
      "catalogs",
      params
        ? [tabPaths[index], JSON.stringify(params)].join(";")
        : tabPaths[index]
    );
  }
}
