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
import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { Observable } from "rxjs";
import { SelectOptionUi } from "../../../../services/codelist/codelist.service";
import { MatListOption, MatSelectionList } from "@angular/material/list";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDivider } from "@angular/material/divider";
import { AsyncPipe } from "@angular/common";

export interface ChipDialogData {
  options: Observable<SelectOptionUi[]>;
  model: any[];
}

@Component({
    selector: "ige-chip-dialog",
    templateUrl: "./chip-dialog.component.html",
    styleUrls: ["./chip-dialog.component.scss"],
    standalone: true,
    imports: [
        CdkDrag,
        CdkDragHandle,
        MatIconButton,
        MatDialogClose,
        MatIcon,
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        MatSelectionList,
        ReactiveFormsModule,
        FormsModule,
        MatDivider,
        MatListOption,
        MatDialogActions,
        MatButton,
        AsyncPipe,
    ],
})
export class ChipDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ChipDialogData) {}

  ngOnInit(): void {}

  getSelection(selected: MatListOption[]) {
    return selected.map((item) => item.value);
  }
}
