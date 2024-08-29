/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
        OverviewComponent,
        ImportComponent,
        ExportComponent,
        ImportReportComponent,
    ],
    providers: [ExchangeService],
})
export class ImportExportModule {}
