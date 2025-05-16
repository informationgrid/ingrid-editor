/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Component, input, output } from "@angular/core";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButton, MatIconButton } from "@angular/material/button";
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "ige-dialog-template",
  templateUrl: "./dialog-template.component.html",
  styleUrls: ["./dialog-template.component.scss"],
  imports: [
    CdkDrag,
    CdkDragHandle,
    MatIconButton,
    MatDialogClose,
    MatIcon,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
  ],
})
export class DialogTemplateComponent {
  label = input<string>("");
  submitLabel = input<string>("Übernehmen");
  disabled = input<boolean>(false);
  contentColor = input<string>("#ffffff");
  submit = output<void>();
  cancel = output<void>();
}
