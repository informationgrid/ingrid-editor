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
import { DocumentListItemComponent } from "./document-list-item/document-list-item.component";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatLineModule } from "@angular/material/core";
import { DocumentIconModule } from "./document-icon/document-icon.module";
import { SharedPipesModule } from "../directives/shared-pipes.module";
import { A11yModule } from "@angular/cdk/a11y";

@NgModule({
  imports: [
    CommonModule,
    MatListModule,
    MatLineModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    DocumentIconModule,
    SharedPipesModule,
    A11yModule,
  ],
  declarations: [DocumentListItemComponent],
  exports: [
    DocumentListItemComponent,
    MatListModule,
    MatLineModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
  ],
})
export class SharedDocumentItemModule {}
