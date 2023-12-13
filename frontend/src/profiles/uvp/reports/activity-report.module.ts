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
import { DocumentIconModule } from "../../../app/shared/document-icon/document-icon.module";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { TranslocoDirective } from "@ngneat/transloco";
import { SharedPipesModule } from "../../../app/directives/shared-pipes.module";
import { ActivityReportComponent } from "./activity-report/activity-report.component";

const routes: Routes = [
  {
    path: "",
    component: ActivityReportComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin"] },
  },
];

@NgModule({
  declarations: [ActivityReportComponent],
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
    DocumentIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    TranslocoDirective,
    SharedPipesModule,
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: GermanDateAdapter,
    },
  ],
})
export class ActivityReportModule {}
