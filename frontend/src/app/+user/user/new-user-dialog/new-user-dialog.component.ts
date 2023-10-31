import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { UserService } from "../../../services/user/user.service";
import { BackendUser, FrontendUser } from "../../user";
import { ConfigService } from "../../../services/config/config.service";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
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
export class NewUserDialogComponent implements OnInit, AfterContentChecked {
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
  form: UntypedFormGroup;
  noAvailableUsers = true;
  importExternal: boolean;
  formlyFieldConfig: FormlyFieldConfig[];
  options: FormlyFormOptions = {};
  model: FrontendUser;
  loginValue = "";

  constructor(
    public dialogRef: MatDialogRef<NewUserDialogComponent>,
    private userService: UserService,
    private configService: ConfigService,
    private modalService: ModalService,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

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
    };
    this.importExternal = false;

    this.form = new UntypedFormGroup({
      login: new UntypedFormControl("", Validators.required),
    });
    this.form
      .get("login")
      .valueChanges.subscribe((value) => this.updateForm(value));

    this.userSub = this.users$.subscribe();
  }

  updateForm(existingLogin) {
    if (existingLogin !== this.loginValue) {
      this.importExternal = false;
      this.loginValue = existingLogin;
      const potentialMatch = this.externalUsers?.filter((user) => {
        return user.login === existingLogin;
      });
      if (potentialMatch?.length) {
        this.model = new FrontendUser(potentialMatch[0]);
        // reset role as keycloak role (ige-user) is not applicable
        this.model.role = "";
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
