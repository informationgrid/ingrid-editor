import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { Permissions } from "../user";
import {
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { PermissionsComponent } from "./permissions.component";

@Component({
  templateUrl: "./permissions-dialog.component.html",
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    PermissionsComponent,
  ],
  standalone: true,
})
export class PermissionsDialogComponent {
  form = new UntypedFormGroup({ permissions: new UntypedFormControl() });

  constructor(@Inject(MAT_DIALOG_DATA) public permissions: Permissions) {
    this.form.patchValue({ permissions: permissions });
  }
}
