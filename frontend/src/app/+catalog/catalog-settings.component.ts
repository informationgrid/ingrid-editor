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
import { Component, ViewChild } from "@angular/core";
import { BehavioursComponent } from "./+behaviours/behaviours.component";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { MatTabLink, MatTabNav, MatTabNavPanel } from "@angular/material/tabs";
import { UntilDestroy } from "@ngneat/until-destroy";
import { TabContainerComponent } from "../+research/tab-container.component";
import { TabPage } from "../services/session.service";

@UntilDestroy()
@Component({
  selector: "ige-catalog-settings",
  templateUrl: "./catalog-settings.component.html",
  styleUrls: ["./catalog-settings.component.scss"],
  imports: [
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    RouterLink,
    MatTabNavPanel,
    RouterOutlet,
  ],
})
export class CatalogSettingsComponent extends TabContainerComponent {
  tabPage: TabPage = "catalogs";

  @ViewChild("navigation") tabNav: MatTabNav;
  @ViewChild("behaviours") behaviourComponent: BehavioursComponent;
}
