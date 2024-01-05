/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
