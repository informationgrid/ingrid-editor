import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PageTemplateComponent } from "./page-template.component";
import { FlexModule } from "@angular/flex-layout";

@NgModule({
  declarations: [PageTemplateComponent],
  imports: [CommonModule, FlexModule],
  exports: [PageTemplateComponent],
})
export class PageTemplateModule {}
