import { routing } from "./import-export.routing";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ImportComponent } from "./import/import.component";
import { ImportExportService } from "./import-export-service";
import { ExportComponent } from "./export/export.component";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatStepperModule } from "@angular/material/stepper";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { SharedModule } from "../shared/shared.module";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { OverviewComponent } from "./overview.component";
import { MatLegacyProgressBarModule as MatProgressBarModule } from "@angular/material/legacy-progress-bar";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { FormSharedModule } from "../+form/form-shared/form-shared.module";
import { UploadModule } from "../shared/upload/upload.module";
import { BreadcrumbModule } from "../+form/form-info/breadcrumb/breadcrumb.module";
import { TranslocoModule } from "@ngneat/transloco";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    MatExpansionModule,
    MatTabsModule,
    MatRadioModule,
    MatButtonModule,
    MatStepperModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule,
    MatSelectModule,
    MatProgressBarModule,
    MatCheckboxModule,
    PageTemplateModule,
    FormSharedModule,
    UploadModule,
    BreadcrumbModule,
    TranslocoModule,
    MatProgressSpinnerModule,
  ],
  declarations: [OverviewComponent, ImportComponent, ExportComponent],
  providers: [ImportExportService],
})
export class ImportExportModule {}
