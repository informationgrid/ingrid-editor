import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './dashboard.routing';
import {DashboardComponent} from './dashboard.component';
import { ChartistModule } from 'ng-chartist';

@NgModule({
  imports: [CommonModule, routing, ChartistModule],
  declarations: [DashboardComponent],
  exports: []
})
export class DashboardModule {}
