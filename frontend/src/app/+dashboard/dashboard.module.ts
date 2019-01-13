import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './dashboard.routing';
import {DashboardComponent} from './dashboard.component';
import {ChartistComponent} from "./chartist.component";
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule, routing],
  declarations: [DashboardComponent, ChartistComponent],
  exports: [RouterModule]
})
export class DashboardModule {}
