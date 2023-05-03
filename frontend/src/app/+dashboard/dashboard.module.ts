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
  ],
  declarations: [
    DashboardComponent,
    DocumentTileComponent,
    QuickSearchComponent,
  ],
})
export class DashboardModule {}
