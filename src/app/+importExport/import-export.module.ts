import {routing} from './import-export.routing';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ImportExportComponent} from './import/import.component';
import {ImportExportService} from './import-export-service';
import {IgeFormModule} from '../+form/ige-form.module';
import { ExportComponent } from './export/export.component';
import {SharedModule} from '../shared.module';
import { AccordionModule, FileUploadModule } from 'primeng/primeng';

@NgModule({
  imports: [CommonModule, routing, FileUploadModule, AccordionModule, SharedModule, IgeFormModule],
  declarations: [ImportExportComponent, ExportComponent],
  providers: [ImportExportService],
  exports: []
})
export class ImportExportModule {

}
