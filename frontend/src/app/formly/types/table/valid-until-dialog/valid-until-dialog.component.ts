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
import { Component, OnInit } from "@angular/core";
import { MatButton, MatIconButton } from "@angular/material/button";
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { CdkScrollable } from "@angular/cdk/scrolling";
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from "@angular/material/datepicker";

@Component({
  selector: "ige-valid-until-dialog",
  templateUrl: "./valid-until-dialog.component.html",
  styleUrls: ["./valid-until-dialog.component.scss"],
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
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatDialogActions,
    MatButton,
  ],
})
export class ValidUntilDialogComponent implements OnInit {
  private date: Date = null;

  constructor() {}

  ngOnInit(): void {}

  updateDate(value: any) {
    this.date = value;
  }

  getDate(): Date {
    return this.date;
  }
}
