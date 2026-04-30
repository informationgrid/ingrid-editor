/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { Component, computed, inject } from "@angular/core";
import { TabPage } from "../../services/session.service";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { MatTabLink, MatTabNav, MatTabNavPanel } from "@angular/material/tabs";
import { TabContainerComponent } from "../../+research/tab-container.component";
import { BehaviourService } from "../../services/behavior/behaviour.service";

@Component({
  selector: "ige-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
  imports: [
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    RouterLink,
    MatTabNavPanel,
    RouterOutlet,
  ],
})
export class ReportsComponent extends TabContainerComponent {
  tabPage: TabPage = "reports";

  private behaviourService = inject(BehaviourService);
  isAiPluginActive = computed(() =>
    this.behaviourService.getBehaviour("plugin.show.ai-assistant").isActive(),
  );

  visibleTabs = computed(() =>
    this.tabs().filter(
      (tab) => this.isAiPluginActive() || !tab.path.startsWith("ai"),
    ),
  );
}
