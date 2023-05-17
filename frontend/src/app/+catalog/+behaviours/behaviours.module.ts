import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BehavioursComponent } from "./behaviours.component";
import { SharedModule } from "../../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatInputModule } from "@angular/material/input";
import { MatTabsModule } from "@angular/material/tabs";
import { FormFieldsModule } from "../../form-fields/form-fields.module";
import { FormlyModule } from "@ngx-formly/core";
import { FormlyMaterialModule } from "@ngx-formly/material";
import { MatCardModule } from "@angular/material/card";
import { FormSharedModule } from "../../+form/form-shared/form-shared.module";
import { PageTemplateModule } from "../../shared/page-template/page-template.module";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { BehaviourItemComponent } from "./behaviour-item/behaviour-item.component";
import { PermissionsDialogComponent } from "../../+user/permissions/permissions-dialog.component";

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
    PermissionsDialogComponent,
  ],
  declarations: [BehavioursComponent, BehaviourItemComponent],
  exports: [BehavioursComponent],
})
export class BehavioursModule {}
