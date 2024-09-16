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
  UntypedFormBuilder,
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
import { MessageService } from "../../../services/messages/message.service";
import {
  MatSlideToggle,
  MatSlideToggleChange,
} from "@angular/material/slide-toggle";
import {
  ConfigService,
  UserInfo,
} from "../../../services/config/config.service";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { CdkScrollable } from "@angular/cdk/scrolling";
import {
  MatFormField,
  MatHint,
  MatLabel,
  MatSuffix,
} from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from "@angular/material/datepicker";
import { MatCardSubtitle } from "@angular/material/card";

@Component({
  selector: "ige-new-message-dialog",
  templateUrl: "./new-message-dialog.component.html",
  styleUrls: ["./new-message-dialog.component.scss"],
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
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatSlideToggle,
    MatHint,
    MatCardSubtitle,
    MatDialogActions,
    MatButton,
  ],
})
export class NewMessageDialogComponent implements OnInit {
  form = new UntypedFormGroup({
    text: new UntypedFormControl("", Validators.required),
    date: new UntypedFormControl(""),
  });

  currentCatalog: boolean = false;
  public userInfo: UserInfo;
  constructor(
    public dialogRef: MatDialogRef<NewMessageDialogComponent>,
    public messageService: MessageService,
    private fb: UntypedFormBuilder,
    private configService: ConfigService,
  ) {}

  ngOnInit(): void {
    this.userInfo = this.configService.$userInfo.getValue();
  }

  slideToggleChange(event: MatSlideToggleChange) {
    this.currentCatalog = event.source.checked;
  }

  createMessage() {
    this.form.disable();
    const message = { text: this.form.get("text").value };
    const validUntil = this.form.get("date").value;
    this.messageService
      .createMessage(message, validUntil, !this.currentCatalog)
      .subscribe(() => this.dialogRef.close());
  }
}
