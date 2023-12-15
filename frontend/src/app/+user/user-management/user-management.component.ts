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
import { Component, HostListener, OnInit } from "@angular/core";
import { UserComponent } from "../user/user.component";
import { GroupComponent } from "../group/group.component";
import { UntilDestroy } from "@ngneat/until-destroy";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService, Tab } from "../../services/session.service";
import { GroupService } from "../../services/role/group.service";

@UntilDestroy()
@Component({
  selector: "ige-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
})
export class UserManagementComponent implements OnInit {
  currentComponent: UserComponent | GroupComponent;

  tabs: Tab[];

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private groupService: GroupService,
    private activeRoute: ActivatedRoute,
  ) {
    this.tabs = sessionService.getTabsFromRoute(activeRoute.snapshot);

    // only update tab from route if it was set explicitly in URL
    // otherwise the remembered state from store is used
    // example: reload page being on 2nd tab -> goto dashboard -> come back again
    const currentPath = this.router.parseUrl(this.router.url).root.children
      .primary.segments[2].path;
    const activeTabIndex = this.tabs.findIndex(
      (tab) => tab.path === currentPath,
    );
    if (activeTabIndex !== 0) {
      this.updateTab(activeTabIndex);
    }
  }

  @HostListener("window:beforeunload", ["$event"])
  unloadHandler() {
    return !this.currentComponent?.form?.dirty;
  }

  onActivate(componentRef) {
    this.currentComponent = componentRef;
  }

  ngOnInit(): void {
    this.groupService.getGroups();
  }

  updateTab(index: number) {
    const tabPaths = this.sessionService.getTabPaths(this.activeRoute.snapshot);
    this.sessionService.updateCurrentTab("manage", tabPaths[index]);
  }
}
