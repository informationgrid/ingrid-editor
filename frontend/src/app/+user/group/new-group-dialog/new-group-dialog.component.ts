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
import { GroupService } from "../../../services/role/group.service";
import { Group } from "../../../models/user-group";
import { ModalService } from "../../../services/modal/modal.service";
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { GroupQuery } from "../../../store/group/group.query";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FocusDirective } from "../../../directives/focus.directive";

@Component({
  selector: "ige-new-group-dialog",
  templateUrl: "./new-group-dialog.component.html",
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
    FocusDirective,
    MatDialogActions,
    MatButton,
  ],
})
export class NewGroupDialogComponent implements OnInit {
  form = new UntypedFormGroup({
    name: new UntypedFormControl("", Validators.required),
  });

  groups = this.groupQuery.getAll();

  constructor(
    private groupService: GroupService,
    private groupQuery: GroupQuery,
    private modalService: ModalService,
    public dialogRef: MatDialogRef<NewGroupDialogComponent>,
  ) {}

  ngOnInit(): void {}

  createGroup() {
    const newGroup = new Group({
      id: null,
      name: this.form.value.name,
    });
    if (this.groups?.filter((group) => group.name === newGroup.name).length) {
      this.modalService.showJavascriptError(
        "Es existiert bereits eine Gruppe mit diesem Namen",
      );
    } else {
      this.groupService.createGroup(newGroup).subscribe((group) => {
        this.dialogRef.close(group);
      });
    }
  }
}
