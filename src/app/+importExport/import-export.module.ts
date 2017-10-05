import {routing} from './import-export.routing';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ImportExportComponent} from './import-export.component';
import {ImportExportService} from './import-export-service';
import {FileUploadModule} from 'ng2-file-upload';
import {IgeFormModule} from '../+form/ige-form.module';
import { ExportComponent } from './export/export.component';
import {AccordionModule} from 'ngx-bootstrap';
import {SharedModule} from '../shared.module';

@NgModule({
  imports: [CommonModule, routing, FileUploadModule, AccordionModule, SharedModule, IgeFormModule],
  declarations: [ImportExportComponent, ExportComponent],
  providers: [ImportExportService],
  exports: []
})
export class ImportExportModule {

}
