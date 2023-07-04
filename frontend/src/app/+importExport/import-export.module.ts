import { routing } from "./import-export.routing";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ImportComponent } from "./import/import.component";
import { ExchangeService } from "./exchange.service";
import { ExportComponent } from "./export/export.component";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatRadioModule } from "@angular/material/radio";
import { MatTabsModule } from "@angular/material/tabs";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatStepperModule } from "@angular/material/stepper";
import { MatInputModule } from "@angular/material/input";
import { SharedModule } from "../shared/shared.module";
import { MatSelectModule } from "@angular/material/select";
import { OverviewComponent } from "./overview.component";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { FormSharedModule } from "../+form/form-shared/form-shared.module";
import { UploadModule } from "../shared/upload/upload.module";
import { BreadcrumbModule } from "../+form/form-info/breadcrumb/breadcrumb.module";
import { TranslocoModule } from "@ngneat/transloco";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ImportReportComponent } from "./import/import-report/import-report.component";
import { JobHandlerHeaderModule } from "../shared/job-handler-header/job-handler-header.module";

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
    JobHandlerHeaderModule,
  ],
  declarations: [
    OverviewComponent,
    ImportComponent,
    ExportComponent,
    ImportReportComponent,
  ],
  providers: [ExchangeService],
})
export class ImportExportModule {}
