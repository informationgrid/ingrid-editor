import {routing} from './import-export.routing';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ImportExportComponent} from './import-export.component';
import {ImportExportService} from './import-export-service';

@NgModule({
  imports: [CommonModule, routing],
  declarations: [ImportExportComponent],
  providers: [ImportExportService],
  exports: []
})
export class ImportExportModule {

}