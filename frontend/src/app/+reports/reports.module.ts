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

@NgModule({
  declarations: [ReportsComponent, GeneralReportComponent],
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
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: GermanDateAdapter,
    },
  ],
})
export class ReportsModule {}
