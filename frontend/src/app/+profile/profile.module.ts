/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { ProfileComponent } from "./profile/profile.component";
import { routing } from "./profile.routing";
import { PageTemplateModule } from "../shared/page-template/page-template.module";
import { SharedModule } from "../shared/shared.module";
import { MatDialogModule } from "@angular/material/dialog";
import { FormSharedModule } from "../+form/form-shared/form-shared.module";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ChangeNameDialogComponent } from "./change-name-dialog/change-name-dialog.component";
import { EmailformComponent } from "../emailform/emailform.component";

@NgModule({
  declarations: [
    ProfileComponent,
    ChangeNameDialogComponent,
    EmailformComponent,
  ],
  imports: [
    MatSnackBarModule,
    CommonModule,
    routing,
    PageTemplateModule,
    SharedModule,
    MatDialogModule,
    FormSharedModule,
  ],
})
export class ProfileModule {}
