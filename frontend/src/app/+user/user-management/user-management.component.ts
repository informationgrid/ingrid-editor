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
import { Component, HostListener, OnInit } from "@angular/core";
import { UserComponent } from "../user/user.component";
import { GroupComponent } from "../group/group.component";
import { UntilDestroy } from "@ngneat/until-destroy";
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { SessionService, TabPage } from "../../services/session.service";
import { GroupService } from "../../services/role/group.service";
import { MatTabLink, MatTabNav, MatTabNavPanel } from "@angular/material/tabs";
import { TabContainerComponent } from "../../+research/tab-container.component";

@UntilDestroy()
@Component({
  selector: "ige-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
  imports: [
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    RouterLink,
    MatTabNavPanel,
    RouterOutlet,
  ],
})
export class UserManagementComponent
  extends TabContainerComponent
  implements OnInit
{
  tabPage: TabPage = "manage";

  currentComponent: UserComponent | GroupComponent;

  constructor(
    protected router: Router,
    protected sessionService: SessionService,
    protected activeRoute: ActivatedRoute,
    private groupService: GroupService,
  ) {
    super(router, sessionService, activeRoute);
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
}
