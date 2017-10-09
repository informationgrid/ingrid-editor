import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogManagerComponent } from './catalog-manager/catalog-manager.component';
import {routing} from './catalog.routing';

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  declarations: [CatalogManagerComponent]
})
export class CatalogModule { }
