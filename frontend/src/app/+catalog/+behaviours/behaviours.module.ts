/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
import { PublicationTypeDialog } from "./system/tags/publication-type/publication-type.dialog";
import { MatRadioModule } from "@angular/material/radio";
import { DialogTemplateModule } from "../../shared/dialog-template/dialog-template.module";
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
    MatSlideToggleModule,
    MatRadioModule,
    DialogTemplateModule,
    /*to get form behaviours*/
    MatSlideToggleModule /*to get form behaviours*/,
    PermissionsDialogComponent,
  ],
  declarations: [
    BehavioursComponent,
    BehaviourItemComponent,
    PublicationTypeDialog,
  ],
  exports: [BehavioursComponent],
})
export class BehavioursModule {}
