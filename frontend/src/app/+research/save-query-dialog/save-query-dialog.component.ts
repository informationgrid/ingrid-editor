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
import { Component, Inject, OnInit } from "@angular/core";
import { SaveQueryDialogResponse } from "./save-query-dialog.response";
import { MatButton, MatIconButton } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FocusDirective } from "../../directives/focus.directive";
import { MatCheckbox } from "@angular/material/checkbox";
import { Query } from "../../store/query/query.model";

@Component({
  selector: "ige-save-query-dialog",
  templateUrl: "./save-query-dialog.component.html",
  styleUrls: ["./save-query-dialog.component.scss"],
  standalone: true,
  imports: [
    MatIconButton,
    MatDialogClose,
    MatIcon,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    FocusDirective,
    FormsModule,
    MatCheckbox,
    MatDialogActions,
    MatButton,
  ],
})
export class SaveQueryDialogComponent implements OnInit {
  model: SaveQueryDialogResponse = {
    forCatalog: false,
  };

  constructor(@Inject(MAT_DIALOG_DATA) public query: Query) {
    if (!query) return;

    this.model = {
      name: query.name,
      description: query.description,
      forCatalog: query.isCatalogQuery,
    };
  }

  ngOnInit(): void {}
}
