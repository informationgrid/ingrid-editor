import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardComponent } from "./dashboard.component";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";
import { ActionButtonComponent } from "./action-button/action-button.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DocumentTileComponent } from "./document-tile/document-tile.component";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { FlexModule } from "@angular/flex-layout";
import { MatDividerModule } from "@angular/material/divider";
import { FeatureFlagDirective } from "../directives/feature-flag.directive";
import { SharedModule } from "../shared/shared.module";
import { MatListModule } from "@angular/material/list";
import { QuickSearchComponent } from "./quick-search/quick-search.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatMenuModule } from "@angular/material/menu";

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
    FlexModule,
    MatDividerModule,
    SharedModule,
    MatListModule,
    MatAutocompleteModule,
    MatMenuModule,
  ],
  declarations: [
    DashboardComponent,
    ActionButtonComponent,
    DocumentTileComponent,
    FeatureFlagDirective,
    QuickSearchComponent,
  ],
})
export class DashboardModule {}
