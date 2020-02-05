import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from './dashboard.component';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../security/auth.guard';
import {ActionButtonComponent} from './action-button/action-button.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DocumentTileComponent} from './document-tile/document-tile.component';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {FlexModule} from '@angular/flex-layout';
import {MatDividerModule} from '@angular/material/divider';
import {FeatureFlagDirective} from '../directives/feature-flag.directive';
import {ChartComponent} from './chart/chart.component';
import {SharedModule} from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard/*, NoCatalogAssignedGuard*/],
    data: {roles: ['admin', 'author']}
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatInputModule, MatCardModule, FlexModule, MatDividerModule, SharedModule
  ],
  declarations: [DashboardComponent, ActionButtonComponent, DocumentTileComponent, FeatureFlagDirective, ChartComponent]
})
export class DashboardModule {
}
