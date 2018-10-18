import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './dashboard.routing';
import {DashboardComponent} from './dashboard.component';
import {ChartistComponent} from "./chartist.component";

@NgModule({
  imports: [CommonModule, routing],
  declarations: [DashboardComponent, ChartistComponent],
  exports: []
})
export class DashboardModule {}
