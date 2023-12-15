/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
    { label: "Verhalten", path: "form-behaviours" },
    { label: "Indizierung", path: "indexing" },
    { label: "Konfiguration", path: "config" },
  ];

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private sessionService: SessionService,
  ) {
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

  ngOnInit(): void {}

  updateTab(index: number) {
    const tabPaths = this.sessionService.getTabPaths(this.activeRoute.snapshot);

    this.sessionService.updateCurrentTab("catalogs", tabPaths[index]);
  }
}
