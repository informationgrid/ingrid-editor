import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReportsComponent } from "./reports/reports.component";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { SharedModule } from "../shared/shared.module";
import { DocumentIconModule } from "../shared/document-icon/document-icon.module";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatSortModule } from "@angular/material/sort";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { DateAdapter } from "@angular/material/core";
import { GermanDateAdapter } from "../services/german-date.adapter";
import { ReactiveFormsModule } from "@angular/forms";
import { GeneralReportComponent } from "./general-report/general-report.component";
import { LazyReportsRouting } from "./lazy-reports.routing";
import { TranslocoModule } from "@ngneat/transloco";
import { UrlCheckComponent } from "./url-check/url-check.component";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { ListDatasetsDialogComponent } from "./url-check/list-datasets-dialog/list-datasets-dialog.component";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import {
  MatLegacyPaginatorIntl as MatPaginatorIntl,
  MatLegacyPaginatorModule as MatPaginatorModule,
} from "@angular/material/legacy-paginator";
import { IgePagingIntl } from "../shared/IgePagingIntl";

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
