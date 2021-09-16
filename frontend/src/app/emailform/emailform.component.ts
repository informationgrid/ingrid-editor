import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FrontendUser } from "../+user/user";

import { UserService } from "./../services/user/user.service";
import { Group } from "../models/user-group";
@Component({
  selector: "ige-emailform",
  templateUrl: "./emailform.component.html",
  styleUrls: ["./emailform.component.scss"],
})
export class EmailformComponent implements OnInit {
  editmode = false;

  @Input()
  email: string = "";

  @Output()
  onClose = new EventEmitter<String>();

  @ViewChild("editForm") emailFormDirective: any;
  emailForm!: FormGroup;
  constructor(private fb: FormBuilder, private userService: UserService) {
    this.createForm();
  }

  ngOnInit(): void {}

  formErrors: { [string: string]: string } = {
    email: "",
  };

  GoToEditMode(): void {
    this.editmode = true;
  }

  validationMessages: { [string: string]: { [string: string]: string } } = {
    email: {
      required: "Email is required.",
      email: "Email not in valid format.",
    },
  };

  createForm() {
    this.emailForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });

    this.emailForm.valueChanges.subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.emailForm) {
      return;
    }
    const form = this.emailForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)

        this.formErrors[field] = "";
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + " ";
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.email = this.emailForm!.get("email").value;
    this.emailForm.reset({
      email: "",
    });

    this.userService
      .updateCurrentUser(
        new FrontendUser({
          attributes: [],
          creationDate: undefined,
          firstName: "",
          lastName: "",
          login: "",
          modificationDate: undefined,
          organisation: "",
          role: "",
          email: this.email,
        })
      )
      .subscribe((user) => {
        debugger;
        if (user) {
          this.onClose.emit(this.email);
          this.editmode = false;
        }
      });
  }
}
