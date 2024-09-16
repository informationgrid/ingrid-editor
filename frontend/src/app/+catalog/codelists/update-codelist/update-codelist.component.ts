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
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { CodelistEntry } from "../../../store/codelist/codelist.model";
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FocusDirective } from "../../../directives/focus.directive";
import { MatDivider } from "@angular/material/divider";
import { AddButtonComponent } from "../../../shared/add-button/add-button.component";

@Component({
  selector: "ige-update-codelist",
  templateUrl: "./update-codelist.component.html",
  styleUrls: ["./update-codelist.component.scss"],
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
    MatError,
    MatDivider,
    AddButtonComponent,
    MatDialogActions,
    MatButton,
  ],
})
export class UpdateCodelistComponent implements OnInit {
  @ViewChild("contextCodeListContainer") container: ElementRef;
  fields: any[];
  isNew = true;

  formGroup: UntypedFormGroup;
  private existingIds: string[];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { entry: CodelistEntry; ids: string[] },
    private dialogRef: MatDialogRef<UpdateCodelistComponent>,
    private fb: UntypedFormBuilder,
  ) {
    this.isNew = data.entry.id === undefined;
    this.fields = Object.keys(data.entry.fields).map((key) => ({
      key: key,
      value: data.entry.fields[key],
    }));
    this.existingIds = data.ids;
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      id: this.fb.control(
        {
          value: this.data.entry.id,
          disabled: this.data.entry.id !== undefined,
        },
        this.checkForExistingId(),
      ),
      description: this.fb.control(this.data.entry.description),
      data: this.fb.control(this.data.entry.data),
      fields: this.fb.array(
        Object.keys(this.data.entry.fields).map((key) =>
          this.fb.group({
            key: [key],
            value: [this.data.entry.fields[key]],
          }),
        ),
      ),
    });
  }

  addEntry() {
    this.fields.push({});
    (<UntypedFormArray>this.formGroup.controls.fields).push(
      this.fb.group({ key: [""], value: [""] }),
    );
  }

  closeWithResult() {
    const result = this.formGroup.getRawValue();
    result.fields = result.fields.reduce((previousValue, currentValue) => {
      previousValue[currentValue.key] = currentValue.value;
      return previousValue;
    }, {});
    this.dialogRef.close(result);
  }

  removeEntry(index: number) {
    this.fields.splice(index, 1);
    (<UntypedFormArray>this.formGroup.controls.fields).removeAt(index);
  }

  private checkForExistingId(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const alreadyExists = this.existingIds.indexOf(control.value) !== -1;
      return alreadyExists ? { duplicate: { value: control.value } } : null;
    };
  }
}
