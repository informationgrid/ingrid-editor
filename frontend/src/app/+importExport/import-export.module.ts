import { routing } from './import-export.routing';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImportExportComponent } from './import/import.component';
import { ImportExportService } from './import-export-service';
import { IgeFormModule } from '../+form/ige-form.module';
import { ExportComponent } from './export/export.component';
import { SharedModule } from '../shared.module';
import { MatButtonModule, MatExpansionModule, MatRadioModule, MatTabsModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  {
    path: '',
    component: ImportExportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule, routing, SharedModule, IgeFormModule,
            MatExpansionModule, MatTabsModule, MatRadioModule, MatButtonModule,
            FlexLayoutModule
  ],
  declarations: [ImportExportComponent, ExportComponent],
  providers: [ImportExportService],
  exports: [RouterModule]
})
export class ImportExportModule {

}
