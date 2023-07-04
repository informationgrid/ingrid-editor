import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PageTemplateComponent } from "./page-template.component";
import { PageTemplateNoHeaderComponent } from "./page-template-no-header.component";

@NgModule({
  declarations: [PageTemplateComponent, PageTemplateNoHeaderComponent],
  imports: [CommonModule],
  exports: [PageTemplateComponent, PageTemplateNoHeaderComponent],
})
export class PageTemplateModule {}
