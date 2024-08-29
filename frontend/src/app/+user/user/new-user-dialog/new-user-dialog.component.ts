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
import { Component, OnInit } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { UserService } from "../../../services/user/user.service";
import { BackendUser, FrontendUser } from "../../user";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { catchError, filter, tap } from "rxjs/operators";
import { MatDialogRef } from "@angular/material/dialog";
import {
  FormlyFieldConfig,
  FormlyFormOptions,
  FormlyModule,
} from "@ngx-formly/core";
import { ModalService } from "../../../services/modal/modal.service";
import { IgeError } from "../../../models/ige-error";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { DialogTemplateComponent } from "../../../shared/dialog-template/dialog-template.component";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";

@UntilDestroy()
@Component({
  selector: "ige-new-user-dialog",
  templateUrl: "./new-user-dialog.component.html",
  styleUrls: ["./new-user-dialog.component.scss"],
  standalone: true,
  imports: [
    DialogTemplateComponent,
    ReactiveFormsModule,
    MatProgressSpinner,
    FormlyModule,
    MatButton,
    MatIcon,
  ],
})
export class NewUserDialogComponent implements OnInit {
  userSub: Subscription;
  users$: Observable<BackendUser[]> = this.userService.getExternalUsers().pipe(
    tap((users) => (this.noAvailableUsers = users.length === 0)),
    tap((users) => (this.externalUsers = users)),
    tap(
      (users) =>
        (this.formlyFieldConfig = this.userService.getNewUserFormFields(users)),
    ),
  );
  externalUsers: BackendUser[];
  form: FormGroup;
  noAvailableUsers = true;
  importExternal = false;
  formlyFieldConfig: FormlyFieldConfig[];
  options: FormlyFormOptions = {
    formState: {
      showGroups: false,
    },
  };
  model: FrontendUser;
  loginValue = "";
  asAdmin: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<NewUserDialogComponent>,
    private userService: UserService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.model = {
      attributes: [],
      creationDate: undefined,
      firstName: "",
      lastName: "",
      login: "",
      modificationDate: undefined,
      organisation: "",
      department: "",
      role: "",
      id: null,
      groups: [],
    };

    this.form = new FormGroup({
      login: new FormControl("", Validators.required),
      role: new FormControl("", Validators.required),
    });
    this.form
      .get("login")
      .valueChanges.pipe(untilDestroyed(this))
      .subscribe((value) => this.updateForm(value));
    this.form
      .get("role")
      .valueChanges.pipe(untilDestroyed(this))
      .subscribe((role) => {
        if (typeof role === "string") {
          this.asAdmin = role === "ige-super-admin" || role === "cat-admin";
          if (this.asAdmin) this.form.get("groups").reset();
        }
      });

    this.userSub = this.users$.subscribe();
  }

  updateForm(existingLogin: string) {
    if (existingLogin !== this.loginValue) {
      this.importExternal = false;
      this.loginValue = existingLogin;
      const role = this.form.get("role").value;
      const potentialMatch = this.externalUsers?.filter((user) => {
        return user.login === existingLogin;
      });
      if (potentialMatch?.length) {
        this.model = new FrontendUser(potentialMatch[0]);
        this.model.role = role;
        this.form.reset(this.model);
        this.importExternal = true;
      }
    }
  }

  createUser() {
    this.form.disable();
    const user = this.model;
    // make sure login is trimmed
    user.login = user.login.trim();

    this.userService
      .createUser(user, !this.importExternal)
      .pipe(
        catchError((error) => this.handleCreateUserError(error)),
        filter((user) => user),
      )
      .subscribe((u) => this.dialogRef.close(u));
  }

  showGroupsPage(show: boolean) {
    this.options.formState.showGroups = show;
  }

  private handleCreateUserError(error: any): Observable<any> {
    this.form.enable();
    const errorText: string = error.error?.errorText;
    if (error.status === 409) {
      if (errorText.includes("User already exists with login")) {
        const login = errorText.split(" ").pop();
        this.modalService.showJavascriptError(
          "Es existiert bereits ein Benutzer mit dem Login: " + login,
        );
        return null;
      } else {
        let EMAIL_NOT_UNIQUE =
          "New user cannot be created, because another user might have the same email address";
        if (errorText.includes(EMAIL_NOT_UNIQUE)) {
          throw new IgeError(
            "Es existiert bereits ein Benutzer mit dieser Mailadresse",
          );
        } else {
          throw error;
        }
      }
    } else if (errorText.includes("Mail server connection failed")) {
      this.dialogRef.close(null);
      throw new IgeError("Es gab ein Problem beim Versenden der Email");
    } else {
      throw error;
    }
  }

  handleSubmit() {
    if (this.asAdmin || this.options.formState.showGroups) {
      this.createUser();
      return;
    }

    this.options.formState.showGroups = true;
  }
}
