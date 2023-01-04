import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BehavioursComponent } from "./behaviours.component";
import { SharedModule } from "../../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { FormFieldsModule } from "../../form-fields/form-fields.module";
import { FormlyModule } from "@ngx-formly/core";
import { FormlyMaterialModule } from "@ngx-formly/material";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { FormSharedModule } from "../../+form/form-shared/form-shared.module";
import { PageTemplateModule } from "../../shared/page-template/page-template.module";
import { MatLegacySlideToggleModule as MatSlideToggleModule } from "@angular/material/legacy-slide-toggle";
import { BehaviourItemComponent } from "./behaviour-item/behaviour-item.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatTabsModule,
    FormlyMaterialModule,
    FormlyModule.forChild(),
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    FormFieldsModule,
    FormlyModule,
    MatCardModule,
    FormSharedModule,
    PageTemplateModule,
    MatSlideToggleModule /*to get form behaviours*/,
  ],
  declarations: [BehavioursComponent, BehaviourItemComponent],
  exports: [BehavioursComponent],
})
export class BehavioursModule {}
