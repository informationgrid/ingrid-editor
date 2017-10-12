import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogManagerComponent } from './catalog-manager/catalog-manager.component';
import {routing} from './catalog.routing';
import { CatalogService } from './catalog.service';

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  providers: [
    CatalogService
  ],
  declarations: [CatalogManagerComponent]
})
export class CatalogModule { }
