/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { SessionService, Tab, TabPage } from "../services/session.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, inject, OnInit } from "@angular/core";

@Component({
  template: "",
})
export abstract class TabContainerComponent implements OnInit {
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private activeRoute = inject(ActivatedRoute);

  tabs: Tab[];
  abstract tabPage: TabPage;

  ngOnInit(): void {
    this.tabs = this.sessionService.getTabsFromRoute(this.activeRoute.snapshot);

    // only update tab from route if it was set explicitly in URL
    // otherwise the remembered state from store is used
    // example: reload page being on 2nd tab -> goto dashboard -> come back again
    const currentPath = this.router.parseUrl(this.router.url).root.children
      .primary.segments[2].path;
    const activeTabIndex = this.tabs.findIndex(
      (tab) => tab.path === currentPath,
    );
    this.updateTab(activeTabIndex);
  }

  updateTab(index: number) {
    const tabPaths = this.sessionService.getTabPaths(this.activeRoute.snapshot);
    this.sessionService.updateCurrentSubpage(this.tabPage, tabPaths[index]);
  }
}
