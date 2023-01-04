import { NgModule } from "@angular/core";
import {
  BreadcrumbComponent,
  BreadCrumbTooltipPipe,
} from "./breadcrumb.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { TranslocoModule } from "@ngneat/transloco";

@NgModule({
  declarations: [BreadcrumbComponent, BreadCrumbTooltipPipe],
  imports: [MatTooltipModule, MatIconModule, CommonModule, TranslocoModule],
  exports: [BreadcrumbComponent],
})
export class BreadcrumbModule {}
