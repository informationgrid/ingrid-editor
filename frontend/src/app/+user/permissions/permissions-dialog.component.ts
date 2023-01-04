import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Permissions } from "../user";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";

@Component({
  templateUrl: "./permissions-dialog.component.html",
})
export class PermissionsDialogComponent {
  form = new UntypedFormGroup({ permissions: new UntypedFormControl() });

  constructor(@Inject(MAT_DIALOG_DATA) public permissions: Permissions) {
    this.form.patchValue({ permissions: permissions });
  }
}
