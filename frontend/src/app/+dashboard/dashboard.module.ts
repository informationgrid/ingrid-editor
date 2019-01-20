import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from './dashboard.component';
import {ChartistComponent} from "./chartist.component";
import {RouterModule, Routes} from "@angular/router";
import {AuthGuard} from "../security/auth.guard";
import {NoCatalogAssignedGuard} from "../security/no-catalog-assigned.guard";
import {SearchBarComponent} from './search-bar/search-bar.component';
import {ActionButtonComponent} from './action-button/action-button.component';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatChipsModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule
} from "@angular/material";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DocumentTileComponent} from './document-tile/document-tile.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard, NoCatalogAssignedGuard],
    data: {roles: ['admin', 'author']}
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes), CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule
  ],
  declarations: [DashboardComponent, ChartistComponent, SearchBarComponent, ActionButtonComponent, DocumentTileComponent],
  exports: [RouterModule]
})
export class DashboardModule {
}
