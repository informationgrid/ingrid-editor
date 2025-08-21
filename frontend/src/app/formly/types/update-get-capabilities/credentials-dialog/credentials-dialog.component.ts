import { Component, inject } from "@angular/core";
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
import { MatDialogRef } from "@angular/material/dialog";
import { FocusDirective } from "../../../../directives/focus.directive";

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

  submit() {
    this.dlgRef.close(this.form.value);
  }
}
