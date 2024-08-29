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
import { FormsModule } from "@angular/forms";
import { routing } from "./ige-form.routing";
import { SharedModule } from "../shared/shared.module";
import { NominatimService } from "../formly/types/map/nominatim.service";
import { ScrollToDirective } from "../directives/scrollTo.directive";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatRadioModule } from "@angular/material/radio";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";

import { RouterModule } from "@angular/router";
import { FormlyModule } from "@ngx-formly/core";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { PasteDialogComponent } from "./dialogs/copy-cut-paste/paste-dialog.component";
import { FormSharedModule } from "./form-shared/form-shared.module";
import { CreateNodeModule } from "./dialogs/create/create-node.module";
import { AngularSplitModule } from "angular-split";

@NgModule({
  imports: [
    RouterModule.forChild(routing),
    CommonModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatListModule,
    MatDialogModule,
    MatRadioModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatCardModule,
    FormlyModule,
    FormSharedModule,
    CreateNodeModule,
    AngularSplitModule,
    PasteDialogComponent,
    ScrollToDirective,
  ],
  providers: [NominatimService],
  exports: [RouterModule, FormsModule, ScrollToDirective],
})
export class IgeFormModule {}
