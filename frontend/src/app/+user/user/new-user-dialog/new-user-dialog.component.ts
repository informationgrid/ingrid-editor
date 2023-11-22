import { Component, OnInit } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { UserService } from "../../../services/user/user.service";
import { BackendUser, FrontendUser } from "../../user";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { catchError, filter, tap } from "rxjs/operators";
import { MatDialogRef } from "@angular/material/dialog";
import { FormlyFieldConfig, FormlyFormOptions } from "@ngx-formly/core";
import { ModalService } from "../../../services/modal/modal.service";
import { IgeError } from "../../../models/ige-error";

@Component({
  selector: "ige-new-user-dialog",
  templateUrl: "./new-user-dialog.component.html",
  styleUrls: ["./new-user-dialog.component.scss"],
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
      .valueChanges.subscribe((value) => this.updateForm(value));
    this.form.get("role").valueChanges.subscribe((role) => {
      if (typeof role === "string") {
        this.asAdmin = role === "ige-super-admin" || role === "cat-admin";
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
          this.modalService.showJavascriptError(
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
}
