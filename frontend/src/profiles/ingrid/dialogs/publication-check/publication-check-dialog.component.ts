/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
import { Component, inject } from "@angular/core";
import { DialogTemplateComponent } from "../../../../app/shared/dialog-template/dialog-template.component";
import { MatIcon } from "@angular/material/icon";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "ige-publication-check",
  standalone: true,
  imports: [
    DialogTemplateComponent,
    MatIcon,
    MatRadioButton,
    MatRadioGroup,
    MatCheckbox,
  ],
  templateUrl: "./publication-check-dialog.component.html",
  styleUrl: "./publication-check-dialog.component.scss",
})
export class PublicationCheckDialogComponent {
  dlgRef = inject(MatDialogRef<boolean>);
}
