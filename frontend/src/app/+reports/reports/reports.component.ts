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
import { Component } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { SessionService } from "../../services/session.service";
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { MatTabLink, MatTabNav, MatTabNavPanel } from "@angular/material/tabs";

@UntilDestroy()
@Component({
  selector: "ige-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
  standalone: true,
  imports: [
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    RouterLink,
    MatTabNavPanel,
    RouterOutlet,
  ],
})
export class ReportsComponent {
  tabs = [];

  constructor(sessionService: SessionService, activeRoute: ActivatedRoute) {
    this.tabs = sessionService.getTabsFromRoute(activeRoute.snapshot);
  }
}
