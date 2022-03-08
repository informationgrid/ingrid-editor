import { NgModule } from "@angular/core";
import { BreadcrumbComponent } from "./breadcrumb.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [BreadcrumbComponent],
  imports: [MatTooltipModule, MatIconModule, CommonModule],
  exports: [BreadcrumbComponent],
})
export class BreadcrumbModule {}
