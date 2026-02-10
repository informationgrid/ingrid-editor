/*
 * ==================================================
 * Copyright (C) 2025-2026 wemove digital solutions GmbH
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
import { Component, Inject, inject, signal } from "@angular/core";
import { DialogTemplateComponent } from "../../../../shared/dialog-template/dialog-template.component";
import { MatInput } from "@angular/material/input";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FocusDirective } from "../../../../directives/focus.directive";

export interface CredentialsDialogData {
  message: string;
}

@Component({
  selector: "ige-credentials-dialog",
  imports: [
    DialogTemplateComponent,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    FocusDirective,
  ],
  templateUrl: "./credentials-dialog.component.html",
  styleUrl: "./credentials-dialog.component.scss",
})
export class CredentialsDialogComponent {
  protected readonly close = close;

  private fb = inject(FormBuilder);
  private dlgRef = inject(MatDialogRef);
  form: FormGroup = this.fb.group({
    username: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
  });
  protected readonly message = signal<string | null>(null);

  constructor(@Inject(MAT_DIALOG_DATA) public data: CredentialsDialogData) {
    this.message.set(data.message);
  }

  submit() {
    this.dlgRef.close(this.form.value);
  }
}
