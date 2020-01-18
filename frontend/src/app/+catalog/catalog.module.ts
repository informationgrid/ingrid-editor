import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CatalogManagerComponent} from './catalog-manager/catalog-manager.component';
import {routing} from './catalog.routing';
import {CatalogService} from './services/catalog.service';
import {CatalogDetailComponent} from './catalog-detail/catalog-detail.component';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RouterModule} from '@angular/router';
import {CatalogDialogsModule} from '../dialogs/catalog/catalog-dialogs.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';

@NgModule( {
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatCardModule, MatButtonModule, MatListModule, MatProgressSpinnerModule, MatDialogModule, MatInputModule,
    CatalogDialogsModule,
    routing
  ],
  providers: [
    CatalogService
  ],
  declarations: [CatalogManagerComponent, CatalogDetailComponent],
  exports: [RouterModule]
} )
export class CatalogModule {
}
