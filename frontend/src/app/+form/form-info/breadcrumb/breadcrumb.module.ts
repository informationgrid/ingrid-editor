import { NgModule } from "@angular/core";
import { BreadcrumbComponent } from "./breadcrumb.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { TranslocoModule } from "@ngneat/transloco";

@NgModule({
  declarations: [BreadcrumbComponent],
  imports: [MatTooltipModule, MatIconModule, CommonModule, TranslocoModule],
  exports: [BreadcrumbComponent],
})
export class BreadcrumbModule {}
