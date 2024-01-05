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
import { Component, forwardRef, Input, OnInit } from "@angular/core";
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
} from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatIconModule } from "@angular/material/icon";
import { PermissionTableComponent } from "./permission-table/permission-table.component";
import { TranslocoModule } from "@ngneat/transloco";
import { NgIf } from "@angular/common";

@UntilDestroy()
@Component({
  selector: "ige-permissions",
  templateUrl: "./permissions.component.html",
  styleUrls: ["./permissions.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PermissionsComponent),
      multi: true,
    },
  ],
  imports: [
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatIconModule,
    PermissionTableComponent,
    TranslocoModule,
    NgIf,
  ],
  standalone: true,
})
export class PermissionsComponent implements OnInit, ControlValueAccessor {
  private onChange: (x: any) => {};
  private onTouch: (x: any) => {};

  @Input() showRootWriteSlider: boolean = false;
  @Input() showRootReadSlider: boolean = false;
  @Input() disabled: boolean = false;

  formGroup: UntypedFormGroup;
  rootPermissionRead = this.fb.control([]);
  rootPermissionWrite = this.fb.control([]);

  constructor(private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      rootPermission: this.fb.control([]),
      documents: this.fb.control([]),
      addresses: this.fb.control([]),
    });

    this.formGroup.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => this.onChange && this.onChange(value));
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(obj: any): void {
    if (obj) {
      this.formGroup.reset();
      this.formGroup.patchValue(obj);

      this.rootPermissionRead.setValue(
        obj.rootPermission == "READ" || obj.rootPermission == "WRITE",
      );
      this.rootPermissionWrite.setValue(obj.rootPermission == "WRITE");
    }
  }

  toggleRootPermission() {
    const read = this.rootPermissionRead.value;
    const write = this.rootPermissionWrite.value;
    this.formGroup.patchValue({
      rootPermission: write ? "WRITE" : read ? "READ" : null,
    });
    console.log(this.formGroup.value);
    this.onChange(this.formGroup.value);
  }
}
