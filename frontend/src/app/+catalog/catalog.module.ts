import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogManagerComponent } from './catalog-manager/catalog-manager.component';
import { routing } from './catalog.routing';
import { CatalogService } from './services/catalog.service';
import { CatalogDetailComponent } from './catalog-detail/catalog-detail.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatListModule, MatSelectModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule( {
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatCardModule, MatButtonModule, MatListModule,
    routing
  ],
  providers: [
    CatalogService
  ],
  declarations: [CatalogManagerComponent, CatalogDetailComponent]
} )
export class CatalogModule {
}
