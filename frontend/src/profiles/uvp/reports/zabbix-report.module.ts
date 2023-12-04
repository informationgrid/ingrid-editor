import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../../app/shared/shared.module";
import { PageTemplateModule } from "../../../app/shared/page-template/page-template.module";
import { DateAdapter } from "@angular/material/core";
import { GermanDateAdapter } from "../../../app/services/german-date.adapter";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../../app/security/auth.guard";
import { ZabbixReportComponent } from "./zabbix-report/zabbix-report.component";

const routes: Routes = [
  {
    path: "",
    component: ZabbixReportComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin"] },
  },
];

@NgModule({
  declarations: [ZabbixReportComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    PageTemplateModule,
    MatTabsModule,
    SharedModule,
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
export class ZabbixReportModule {}
