import { Injectable } from "@angular/core";
import { BackendUser, FrontendUser, User } from "../../+user/user";
import { BehaviorSubject, Observable } from "rxjs";
import { UserDataService } from "./user-data.service";
import { catchError, map, tap } from "rxjs/operators";
import { SelectOptionUi } from "../codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { GroupService } from "../role/group.service";
import { getUserFormFields } from "../../+user/user/user.formly-fields";
import { getNewUserFormFields } from "../../+user/user/new-user-dialog/new-user.formly-fields";
import { ConfigService } from "../config/config.service";
import { IgeError } from "../../models/ige-error";
import { HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormlyAttributeEvent } from "@ngx-formly/core/lib/components/formly.field.config";
import { AuthenticationFactory } from "../../security/auth.factory";

@Injectable({
  providedIn: "root",
})
export class UserService {
  availableRoles: SelectOptionUi[] = [
    { label: "Katalog-Administrator", value: "cat-admin" },
    { label: "Metadaten-Administrator", value: "md-admin" },
    { label: "Autor", value: "author" },
  ];

  roleIcon = {
    "ige-super-admin": "catalog-admin",
    "cat-admin": "catalog-admin",
    "md-admin": "meta-admin",
    author: "author",
  };

  selectedUser$ = new BehaviorSubject<User>(null);

  constructor(
    private dataService: UserDataService,
    private groupService: GroupService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private keycloakService: AuthenticationFactory
  ) {
    if (!this.configService.isAdmin()) {
      this.availableRoles = this.availableRoles.filter(
        (o) => o.value != "cat-admin"
      );
    }
  }

  getUsers(): Observable<FrontendUser[]> {
    return this.dataService
      .getUsers()
      .pipe(map((json: any[]) => json.map((item) => new FrontendUser(item))));
  }

  getCatAdmins(): Observable<FrontendUser[]> {
    return this.dataService
      .getCatAdmins()
      .pipe(map((json: any[]) => json.map((item) => new FrontendUser(item))));
  }

  getUser(login: string): Observable<FrontendUser> {
    return this.dataService
      .getUser(login)
      .pipe(map((user) => new FrontendUser(user)));
  }

  updateUser(user: FrontendUser): Observable<FrontendUser> {
    const userForBackend = <BackendUser>{
      ...user,
      groups: user.groups.map((group) => +group.value),
    };

    return this.dataService.saveUser(userForBackend).pipe(
      map((u) => new FrontendUser(u)),
      catchError((error) => {
        if (error.status === 404) {
          throw new IgeError(
            "Es existiert kein Benutzer mit dem Login: " + user.login
          );
        } else {
          throw error;
        }
      })
    );
  }

  updateCurrentUser(user: Partial<User>): Observable<boolean> {
    return this.keycloakService.updateUserProfile(user);
  }

  private static handleChangeEmailError(
    response: HttpErrorResponse
  ): Observable<any> {
    if (response.error.errorText === "Conflicting email address") {
      throw new IgeError(
        "Die Email-Adresse ist schon vorhanden. Bitte wählen Sie eine andere aus."
      );
    }

    throw response;
  }

  createUser(user: User, isNewExternalUser: boolean): Observable<FrontendUser> {
    return this.dataService.createUser(user, isNewExternalUser).pipe(
      map((u) => new FrontendUser(u)),
      tap(() => {
        this.snackBar.open("Registrierungs-E-Mail wurde versandt", "", {
          panelClass: "green",
        });
      })
    );
  }

  deleteUser(login: string): Observable<any> {
    return this.dataService.deleteUser(login);
  }

  getAssignedUsers(dbId: string) {
    return this.dataService.getAssignedUsers(dbId);
  }

  getExternalUsers(): Observable<BackendUser[]> {
    return this.dataService.getExternalUsers();
  }

  private getExternalUsersAsSelectOptions(): Observable<SelectOptionUi[]> {
    return this.getExternalUsers().pipe(
      map((users) =>
        users.map((user) => {
          return { label: user.login, value: user.login };
        })
      )
    );
  }

  getUserFormFields(
    groups,
    groupClickCallback: (id: string) => void = undefined,
    roleChangeCallback: FormlyAttributeEvent = undefined
  ): FormlyFieldConfig[] {
    console.log("get user form fields");
    return getUserFormFields(
      this.availableRoles,
      groups,
      groupClickCallback,
      roleChangeCallback
    );
  }

  getNewUserFormFields(): FormlyFieldConfig[] {
    return getNewUserFormFields(
      this.availableRoles,
      this.getExternalUsersAsSelectOptions()
    );
  }

  updatePassword(): Promise<void> {
    return this.keycloakService.updatePassword();
  }
}
