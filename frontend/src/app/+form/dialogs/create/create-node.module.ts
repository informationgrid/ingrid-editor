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
import { CreateNodeComponent } from "./create-node.component";
import { DestinationSelectionComponent } from "./destination-selection/destination-selection.component";
import { AddressTemplateComponent } from "./address-template/address-template.component";
import { DocumentTemplateComponent } from "./document-template/document-template.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";

import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";

import { MatInputModule } from "@angular/material/input";

import { SharedModule } from "../../../shared/shared.module";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { TranslocoModule } from "@ngneat/transloco";

@NgModule({
  imports: [
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule,
    TranslocoModule,
    DragDropModule,
    CreateNodeComponent,
    DestinationSelectionComponent,
    AddressTemplateComponent,
    DocumentTemplateComponent,
  ],
  exports: [DestinationSelectionComponent],
})
export class CreateNodeModule {}
