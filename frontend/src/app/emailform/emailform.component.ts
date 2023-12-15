/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
    private userService: UserService,
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
