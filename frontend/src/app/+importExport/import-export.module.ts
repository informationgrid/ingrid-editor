import {routing} from './import-export.routing';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ImportComponent} from './import/import.component';
import {ImportExportService} from './import-export-service';
import {ExportComponent} from './export/export.component';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatRadioModule} from '@angular/material/radio';
import {MatTabsModule} from '@angular/material/tabs';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatInputModule} from '@angular/material/input';
import {SharedModule} from '../shared/shared.module';
import {MatSelectModule} from "@angular/material/select";
import {OverviewComponent} from "./overview.component";
import {UploadComponent} from "./upload/upload.component";
import {MatProgressBarModule} from "@angular/material/progress-bar";

@NgModule({
  imports: [CommonModule, routing, FormsModule,
    MatExpansionModule, MatTabsModule, MatRadioModule, MatButtonModule,
    MatStepperModule,
    FlexLayoutModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, SharedModule, MatSelectModule, MatProgressBarModule
  ],
  declarations: [OverviewComponent, ImportComponent, ExportComponent, UploadComponent],
  providers: [ImportExportService]
})
export class ImportExportModule {

}
