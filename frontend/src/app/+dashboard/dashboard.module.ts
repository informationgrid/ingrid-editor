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
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardComponent } from "./dashboard.component";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DocumentTileComponent } from "./document-tile/document-tile.component";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { SharedModule } from "../shared/shared.module";
import { MatListModule } from "@angular/material/list";
import { QuickSearchComponent } from "./quick-search/quick-search.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatMenuModule } from "@angular/material/menu";
import { TranslocoModule } from "@ngneat/transloco";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ActionButtonModule } from "../shared/action-button/action-button.module";
import { MatCheckbox } from "@angular/material/checkbox";

const routes: Routes = [
  {
    path: "",
    component: DashboardComponent,
    canActivate: [AuthGuard /*, NoCatalogAssignedGuard*/],
    data: { roles: ["admin", "author"] },
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    SharedModule,
    MatListModule,
    MatAutocompleteModule,
    MatMenuModule,
    TranslocoModule,
    MatProgressSpinnerModule,
    ActionButtonModule,
    MatCheckbox,
  ],
  declarations: [
    DashboardComponent,
    DocumentTileComponent,
    QuickSearchComponent,
  ],
})
export class DashboardModule {}
