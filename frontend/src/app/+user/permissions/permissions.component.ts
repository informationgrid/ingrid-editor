import { Component, forwardRef, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PagePermission } from "./page-permission";
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

  pagePermissions: PagePermission[];
  formGroup: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      pages: this.fb.group(
        this.router.config
          .filter((route) => route.data)
          .reduce((prev, curr) => {
            prev[curr.path] = this.fb.control(false);
            return prev;
          }, {})
      ),
      actions: this.fb.group({ demo: [false], test: [false] }),
      documents: this.fb.control([]),
      addresses: this.fb.control([]),
    });

    this.formGroup.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => this.onChange && this.onChange(value));

    this.pagePermissions = this.router.config
      .filter((route) => route.data)
      .map((route) => new PagePermission(route.path, route.data.title));
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
    }
  }
}
