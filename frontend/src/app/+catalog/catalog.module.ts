import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './catalog.routing';
import {CatalogService} from './services/catalog.service';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RouterModule} from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {CatalogCodelistsComponent} from './codelists/catalog-codelists.component';
import {MatSelectModule} from '@angular/material/select';
import {BehavioursModule} from './+behaviours/behaviours.module';
import {SharedModule} from '../shared/shared.module';
import {IndexingComponent} from './indexing/indexing.component';
import {CatalogSettingsComponent} from './catalog-settings.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatCardModule, MatButtonModule, MatListModule, MatProgressSpinnerModule, MatDialogModule, MatInputModule,
    routing, MatIconModule, MatTabsModule, MatSelectModule, BehavioursModule, SharedModule
  ],
  providers: [
    CatalogService
  ],
  declarations: [CatalogSettingsComponent, CatalogCodelistsComponent, IndexingComponent],
  exports: [RouterModule]
})
export class CatalogModule {
}
