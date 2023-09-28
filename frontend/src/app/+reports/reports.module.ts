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
