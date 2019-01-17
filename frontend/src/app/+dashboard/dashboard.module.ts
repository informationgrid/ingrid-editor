import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from './dashboard.component';
import {ChartistComponent} from "./chartist.component";
import {RouterModule, Routes} from "@angular/router";
import {AuthGuard} from "../security/auth.guard";
import {NoCatalogAssignedGuard} from "../security/no-catalog-assigned.guard";

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard, NoCatalogAssignedGuard],
    data: {roles: ['admin', 'author']}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule],
  declarations: [DashboardComponent, ChartistComponent],
  exports: [RouterModule]
})
export class DashboardModule {
}
