import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReportsComponent } from "./reports/reports.component";
import { routing } from "../+reports/reports.routing";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { MatTabsModule } from "@angular/material/tabs";
import { SharedModule } from "../shared/shared.module";
import { DocumentIconModule } from "../shared/document-icon/document-icon.module";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";

@NgModule({
  declarations: [ReportsComponent],
  imports: [
    CommonModule,
    routing,
    PageTemplateModule,
    MatTabsModule,
    SharedModule,
    DocumentIconModule,
    MatTableModule,
    MatSortModule,
  ],
})
export class ReportsModule {}
