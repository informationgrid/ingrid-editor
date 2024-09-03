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
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { ModalService } from "../../services/modal/modal.service";
import { UserService } from "../../services/user/user.service";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";

@Component({
  selector: "ige-change-name-dialog",
  templateUrl: "./change-name-dialog.component.html",
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
    MatDialogActions,
    MatButton,
  ],
})
export class ChangeNameDialogComponent implements OnInit {
  form = new UntypedFormGroup({
    firstName: new UntypedFormControl("", Validators.required),
    lastName: new UntypedFormControl("", Validators.required),
  });

  constructor(
    private modalService: ModalService,
    public dialogRef: MatDialogRef<ChangeNameDialogComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {}

  ngOnInit(): void {
    this.form.setValue({
      firstName: this.data?.firstName ?? "",
      lastName: this.data?.lastName ?? "",
    });
  }

  changeName() {
    this.userService
      .updateCurrentUser({
        firstName: this.form.value.firstName,
        lastName: this.form.value.lastName,
      })
      .subscribe(() => this.dialogRef.close(true));
  }
}
