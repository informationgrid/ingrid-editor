/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Observable, of, Subscription } from "rxjs";
import { UserService } from "../../../services/user/user.service";
import { BackendUser, FrontendUser } from "../../user";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { catchError, filter, finalize, tap } from "rxjs/operators";
import { MatDialogRef } from "@angular/material/dialog";
import {
  FormlyFieldConfig,
  FormlyForm,
  FormlyFormOptions,
} from "@ngx-formly/core";
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
  imports: [
    DialogTemplateComponent,
    ReactiveFormsModule,
    MatProgressSpinner,
    MatButton,
    MatIcon,
    FormlyForm,
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
        filter((user) => user !== undefined),
        catchError((error: IgeError) => {
          if (error.message.includes("Problem beim Versenden der Email")) {
            this.dialogRef.close();
          }
          throw error;
        }),
        finalize(() => this.form.enable()),
      )
      .subscribe((u) => this.dialogRef.close(u));
  }

  showGroupsPage(show: boolean) {
    this.options.formState.showGroups = show;
  }

  handleSubmit() {
    if (this.asAdmin || this.options.formState.showGroups) {
      this.createUser();
      return;
    }

    this.options.formState.showGroups = true;
  }
}
