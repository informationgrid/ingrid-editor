import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from "@angular/core";
import { Observable } from "rxjs";
import { UserService } from "../../../services/user/user.service";
import { FrontendUser, User } from "../../user";
import { ConfigService } from "../../../services/config/config.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { tap } from "rxjs/operators";
import { MatDialogRef } from "@angular/material/dialog";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ModalService } from "../../../services/modal/modal.service";

@Component({
  selector: "ige-new-user-dialog",
  templateUrl: "./new-user-dialog.component.html",
  styleUrls: ["./new-user-dialog.component.scss"],
})
export class NewUserDialogComponent implements OnInit, AfterContentChecked {
  users$: Observable<FrontendUser[]> = this.userService.getExternalUsers().pipe(
    tap((users) => (this.noAvailableUsers = users.length === 0)),
    tap((users) => (this.externalUsers = users))
  );
  externalUsers: FrontendUser[];
  form: FormGroup;
  noAvailableUsers = true;
  importExternal: boolean;
  formlyFieldConfig: FormlyFieldConfig[];
  model: FrontendUser;
  loginValue = "";

  constructor(
    public dialogRef: MatDialogRef<NewUserDialogComponent>,
    private userService: UserService,
    private configService: ConfigService,
    private modalService: ModalService,
    private cdRef: ChangeDetectorRef
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
      role: "",
    };
    this.importExternal = false;
    this.formlyFieldConfig = this.userService.getNewUserFormFields();

    this.form = new FormGroup({
      role: new FormControl("", Validators.required),
      login: new FormControl("", Validators.required),
      firstName: new FormControl("", Validators.required),
      lastName: new FormControl("", Validators.required),
      email: new FormControl("", Validators.required),
    });
    this.form
      .get("login")
      .valueChanges.subscribe((value) => this.updateForm(value));

    this.users$.subscribe();
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
    let createUserObserver: Observable<User>;

    // convert roles to numbers
    // user.roles = user.roles.map(role => +role);
    this.form.disable();
    const user = this.model;

    this.userService.createUser(user, !this.importExternal).subscribe(
      () => {
        this.dialogRef.close(user);
      },
      (err: any) => {
        this.form.enable();
        if (err.status === 409) {
          const errorText: string = err.error.errorText;
          if (errorText.includes("User already Exists with login")) {
            const login = errorText.split(" ").pop();
            this.modalService.showJavascriptError(
              "Es existiert bereits ein Benutzer mit dem Login: " + login
            );
          } else if (
            errorText.includes(
              "New user cannot be created, because another user might have the same email address"
            )
          ) {
            this.modalService.showJavascriptError(
              "Es existiert bereits ein Benutzer mit dieser Mailadresse"
            );
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    );
  }
}
