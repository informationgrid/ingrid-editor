import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProfileComponent } from "./profile/profile.component";
import { routing } from "./profile.routing";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [ProfileComponent],
  imports: [CommonModule, routing, PageTemplateModule, SharedModule],
})
export class ProfileModule {}
