import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatSortModule } from "@angular/material/sort";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../../app/shared/shared.module";
import { PageTemplateModule } from "../../../app/shared/page-template/page-template.module";
import { DateAdapter } from "@angular/material/core";
import { GermanDateAdapter } from "../../../app/services/german-date.adapter";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../../app/security/auth.guard";
import { UploadCheckComponent } from "./upload-check/upload-check.component";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";

const routes: Routes = [
  {
    path: "",
    component: UploadCheckComponent,
    canActivate: [AuthGuard],
    data: { permission: ["manage_catalog"] },
  },
];

@NgModule({
  declarations: [UploadCheckComponent],
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
    MatCheckboxModule,
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: GermanDateAdapter,
    },
  ],
})
export class UploadCheckModule {}
