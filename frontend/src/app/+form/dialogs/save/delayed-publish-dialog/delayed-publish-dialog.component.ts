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
import {
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { ModalService } from "../../../../services/modal/modal.service";
import { MatButton, MatIconButton } from "@angular/material/button";
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
import { FocusDirective } from "../../../../directives/focus.directive";

@Component({
  selector: "delayed-publish-dialog",
  templateUrl: "./delayed-publish-dialog.component.html",
  standalone: true,
  imports: [
    MatIconButton,
    MatDialogClose,
    MatIcon,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    FocusDirective,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatDialogActions,
    MatButton,
  ],
})
export class DelayedPublishDialogComponent implements OnInit {
  form = new UntypedFormGroup({
    date: new UntypedFormControl("", Validators.required),
  });
  minDate: Date;

  constructor(
    private modalService: ModalService,
    public dialogRef: MatDialogRef<DelayedPublishDialogComponent>,
  ) {}

  ngOnInit(): void {
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);
  }

  setDateAndPublish() {
    const delayDate = this.form.get("date").value;
    if (delayDate < new Date()) {
      this.modalService.showJavascriptError(
        "Das Datum liegt in der Vergangenheit. Bitte wählen Sie ein anderes Datum.",
      );
      return;
    }
    this.dialogRef.close(delayDate);
  }
}
