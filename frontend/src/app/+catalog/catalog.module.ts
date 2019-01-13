import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogManagerComponent } from './catalog-manager/catalog-manager.component';
import { routing } from './catalog.routing';
import { CatalogService } from './services/catalog.service';
import { CatalogDetailComponent } from './catalog-detail/catalog-detail.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatListModule, MatSelectModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import {RouterModule, Routes} from "@angular/router";
import {ImportExportComponent} from "../+importExport/import/import.component";


const routes: Routes = [
  {
    path: '',
    component: CatalogManagerComponent
  }
];

@NgModule( {
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatCardModule, MatButtonModule, MatListModule,
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
