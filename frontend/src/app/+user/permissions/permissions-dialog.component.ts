import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Permissions } from "../user";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  templateUrl: "./permissions-dialog.component.html",
})
export class PermissionsDialogComponent {
  form = new FormGroup({ permissions: new FormControl() });

  constructor(@Inject(MAT_DIALOG_DATA) public permissions: Permissions) {
    this.form.patchValue({ permissions: permissions });
  }
}
