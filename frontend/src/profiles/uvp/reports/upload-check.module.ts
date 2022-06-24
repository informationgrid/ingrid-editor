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
import { UploadCheckComponent } from "./upload-check/upload-check.component";
import { MatCheckboxModule } from "@angular/material/checkbox";

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
