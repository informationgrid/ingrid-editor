import { Injectable } from "@angular/core";
import { BackendUser, FrontendUser, User } from "../../+user/user";
import { BehaviorSubject, Observable } from "rxjs";
import { UserDataService } from "./user-data.service";
import { catchError, map, tap } from "rxjs/operators";
import { SelectOption, SelectOptionUi } from "../codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { GroupService } from "../role/group.service";
import { getUserFormFields } from "../../+user/user/user.formly-fields";
import { getNewUserFormFields } from "../../+user/user/new-user-dialog/new-user.formly-fields";
import { ConfigService } from "../config/config.service";
import { IgeError } from "../../models/ige-error";
import { HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthenticationFactory } from "../../security/auth.factory";
import { FormlyAttributeEvent } from "@ngx-formly/core/lib/models";

@Injectable({
  providedIn: "root",
})
export class UserService {
  availableRoles: SelectOptionUi[] = [
    new SelectOption("cat-admin", "Katalog-Administrator"),
    new SelectOption("md-admin", "Metadaten-Administrator"),
    new SelectOption("author", "Autor"),
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

  getUserIdsFromAllCatalogs(): Observable<String[]> {
    return this.dataService.getAllUserIds();
  }

  assignUserToCatalog(userId: string, catalogId: string): Observable<void> {
    return this.dataService.assignUserToCatalog(userId, catalogId);
  }

  getCatAdmins(catalogId: String): Observable<FrontendUser[]> {
    return this.dataService
      .getCatAdmins(catalogId)
      .pipe(map((json: any[]) => json.map((item) => new FrontendUser(item))));
  }

  getUser(id: number): Observable<FrontendUser> {
    return this.dataService
      .getUser(id)
      .pipe(map((user) => new FrontendUser(user)));
  }

  updateUser(user: FrontendUser): Observable<FrontendUser> {
    const userForBackend = <BackendUser>{
      ...user,
      groups: user.groups.map((group) => +group.key),
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
    return this.keycloakService
      .updateUserProfile(user)
      .pipe(catchError((error) => UserService.handleChangeEmailError(error)));
  }

  private static handleChangeEmailError(
    response: HttpErrorResponse
  ): Observable<any> {
    if (
      response.status === 409 &&
      response.error.errorMessage === "emailExistsMessage"
    ) {
      throw new IgeError(
        "Diese E-Mail-Adresse wird bereits für einen anderen Benutzernamen verwendet."
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

  deleteUser(userId: number): Observable<any> {
    return this.dataService.deleteUser(userId);
  }

  getAssignedUsers(dbId: string) {
    return this.dataService.getAssignedUsers(dbId);
  }

  getExternalUsers(): Observable<BackendUser[]> {
    return this.dataService.getExternalUsers();
  }

  private getExternalUsersAsSelectOptions(
    users: BackendUser[]
  ): SelectOptionUi[] {
    return users.map((user) => {
      return new SelectOption(user.login, user.login);
    });
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

  getNewUserFormFields(users: BackendUser[]): FormlyFieldConfig[] {
    return getNewUserFormFields(
      this.availableRoles,
      this.getExternalUsersAsSelectOptions(users)
    );
  }

  updatePassword(): Promise<void> {
    return this.keycloakService.updatePassword();
  }

  resetPassword(login: string) {
    return this.dataService.resetPassword(login);
  }
}
