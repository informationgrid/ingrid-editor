import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardComponent } from "./dashboard.component";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";
import { ActionButtonComponent } from "./action-button/action-button.component";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DocumentTileComponent } from "./document-tile/document-tile.component";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { FlexModule } from "@angular/flex-layout";
import { MatDividerModule } from "@angular/material/divider";
import { SharedModule } from "../shared/shared.module";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";
import { QuickSearchComponent } from "./quick-search/quick-search.component";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { TranslocoModule } from "@ngneat/transloco";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";

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
    TranslocoModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    DashboardComponent,
    ActionButtonComponent,
    DocumentTileComponent,
    QuickSearchComponent,
  ],
})
export class DashboardModule {}
