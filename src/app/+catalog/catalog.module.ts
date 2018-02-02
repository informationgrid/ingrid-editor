import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogManagerComponent } from './catalog-manager/catalog-manager.component';
import { routing } from './catalog.routing';
import { CatalogService } from './catalog.service';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ListboxModule } from 'primeng/listbox';
import { CatalogDetailComponent } from './catalog-detail/catalog-detail.component';
import { FormsModule } from '@angular/forms';

@NgModule( {
  imports: [
    CommonModule,
    FormsModule,
    FileUploadModule,
    InputTextModule,
    DialogModule,
    ListboxModule,
    routing
  ],
  providers: [
    CatalogService
  ],
  declarations: [CatalogManagerComponent, CatalogDetailComponent]
} )
export class CatalogModule {
}
