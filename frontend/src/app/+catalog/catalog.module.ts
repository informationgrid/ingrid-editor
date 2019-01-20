import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CatalogManagerComponent} from './catalog-manager/catalog-manager.component';
import {routing} from './catalog.routing';
import {CatalogService} from './services/catalog.service';
import {CatalogDetailComponent} from './catalog-detail/catalog-detail.component';
import {FormsModule} from '@angular/forms';
import {MatButtonModule, MatCardModule, MatListModule} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RouterModule, Routes} from "@angular/router";
import {CatalogDialogsModule} from "../dialogs/catalog/catalog-dialogs.module";


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
