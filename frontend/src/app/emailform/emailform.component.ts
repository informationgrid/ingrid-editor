import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";

import { UserService } from "../services/user/user.service";

@Component({
  selector: "ige-emailform",
  templateUrl: "./emailform.component.html",
  styleUrls: ["./emailform.component.scss"],
})
export class EmailformComponent implements OnInit {
  @Input()
  initialEmail: string;

  @Input()
  canAutocomplete = false;

  @Output()
  onClose = new EventEmitter<String>();

  @ViewChild("editForm") emailFormDirective: any;
  emailForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private userService: UserService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.emailForm.get("email").setValue(this.initialEmail);
  }

  formErrors: { [string: string]: string } = {
    email: "Bitte geben Sie eine gültige Mailadresse an.",
  };

  createForm() {
    this.emailForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    this.onClose.emit(this.emailForm!.get("email").value);
  }

  abortChange() {
    this.onClose.emit();
  }
}
