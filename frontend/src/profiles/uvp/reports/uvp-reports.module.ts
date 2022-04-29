import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { ReactiveFormsModule } from "@angular/forms";
import { UvpBerichtComponent } from "./uvp-bericht/uvp-bericht.component";
import { SharedModule } from "../../../app/shared/shared.module";
import { PageTemplateModule } from "../../../app/shared/page-template/page-template.module";
import { DateAdapter } from "@angular/material/core";
import { GermanDateAdapter } from "../../../app/services/german-date.adapter";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../../app/security/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: UvpBerichtComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin", "author"] },
  },
];

@NgModule({
  declarations: [UvpBerichtComponent],
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
export class UvpReportsModule {}
