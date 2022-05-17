import { Component, forwardRef, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

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
})
export class PermissionsComponent implements OnInit, ControlValueAccessor {
  private onChange: (x: any) => {};
  private onTouch: (x: any) => {};

  formGroup: FormGroup;
  rootPermissionRead = this.fb.control([]);
  rootPermissionWrite = this.fb.control([]);

  constructor(private router: Router, private fb: FormBuilder) {}

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
        obj.rootPermission == "READ" || obj.rootPermission == "WRITE"
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
    this.onChange(this.formGroup.value);
  }
}
