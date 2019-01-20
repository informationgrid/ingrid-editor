import {routing} from './import-export.routing';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ImportExportComponent} from './import/import.component';
import {ImportExportService} from './import-export-service';
import {ExportComponent} from './export/export.component';
import {MatButtonModule, MatExpansionModule, MatRadioModule, MatTabsModule} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RouterModule, Routes} from "@angular/router";
import {FormsModule} from "@angular/forms";

const routes: Routes = [
  {
    path: '',
    component: ImportExportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule, routing, FormsModule,
            MatExpansionModule, MatTabsModule, MatRadioModule, MatButtonModule,
            FlexLayoutModule
  ],
  declarations: [ImportExportComponent, ExportComponent],
  providers: [ImportExportService]
})
export class ImportExportModule {

}
