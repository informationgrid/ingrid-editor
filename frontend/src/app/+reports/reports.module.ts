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
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReportsComponent } from "./reports/reports.component";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { MatTabsModule } from "@angular/material/tabs";
import { SharedModule } from "../shared/shared.module";
import { DocumentIconModule } from "../shared/document-icon/document-icon.module";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { DateAdapter } from "@angular/material/core";
import { GermanDateAdapter } from "../services/german-date.adapter";
import { ReactiveFormsModule } from "@angular/forms";
import { GeneralReportComponent } from "./general-report/general-report.component";
import { LazyReportsRouting } from "./lazy-reports.routing";
import { TranslocoModule } from "@ngneat/transloco";
import { UrlCheckComponent } from "./url-check/url-check.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ListDatasetsDialogComponent } from "./url-check/list-datasets-dialog/list-datasets-dialog.component";
import { MatDialogModule } from "@angular/material/dialog";
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from "@angular/material/paginator";
import { IgePagingIntl } from "../shared/IgePagingIntl";
import { JobHandlerHeaderModule } from "../shared/job-handler-header/job-handler-header.module";
import { A11yModule } from "@angular/cdk/a11y";
import { ResultTableHeaderComponent } from "../+research/result-table/result-table-header/result-table-header.component";

@NgModule({
  declarations: [
    ReportsComponent,
    GeneralReportComponent,
    UrlCheckComponent,
    ListDatasetsDialogComponent,
  ],
  imports: [
    CommonModule,
    LazyReportsRouting,
    PageTemplateModule,
    MatTabsModule,
    SharedModule,
    DocumentIconModule,
    MatTableModule,
    MatSortModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    TranslocoModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatPaginatorModule,
    JobHandlerHeaderModule,
    A11yModule,
    ResultTableHeaderComponent,
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: GermanDateAdapter,
    },
    {
      provide: MatPaginatorIntl,
      useValue: new IgePagingIntl(),
    },
  ],
})
export class ReportsModule {}
