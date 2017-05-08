import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './dashboard.routing';
import {DashboardComponent} from './dashboard.component';
import {ChartsModule} from 'ng2-charts';

@NgModule({
  imports: [CommonModule, routing, ChartsModule],
  declarations: [DashboardComponent],
  exports: []
})
export class DashboardModule {}
