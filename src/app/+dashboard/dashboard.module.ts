import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './dashboard.routing';
import {DashboardComponent} from './dashboard.component';
import { ChartModule } from 'primeng/chart';

@NgModule({
  imports: [CommonModule, routing, ChartModule],
  declarations: [DashboardComponent],
  exports: []
})
export class DashboardModule {}
