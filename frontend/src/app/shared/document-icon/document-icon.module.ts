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
import { DocumentIconComponent } from "./document-icon.component";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslocoModule } from "@ngneat/transloco";

@NgModule({
  imports: [
    MatIconModule,
    CommonModule,
    MatTooltipModule,
    TranslocoModule,
    DocumentIconComponent,
  ],
  exports: [DocumentIconComponent],
})
export class DocumentIconModule {}
