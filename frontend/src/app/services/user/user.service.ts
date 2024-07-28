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
import { Injectable, signal } from "@angular/core";
import { BackendUser, FrontendUser, User } from "../../+user/user";
import { Observable } from "rxjs";
import { UserDataService } from "./user-data.service";
import { catchError, map, tap } from "rxjs/operators";
import { SelectOption, SelectOptionUi } from "../codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { getUserFormFields } from "../../+user/user/user.formly-fields";
import { getNewUserFormFields } from "../../+user/user/new-user-dialog/new-user.formly-fields";
import { ConfigService } from "../config/config.service";
import { IgeError } from "../../models/ige-error";
import { HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthenticationFactory } from "../../security/auth.factory";
import { FormlyAttributeEvent } from "@ngx-formly/core/lib/models";
import { GroupQuery } from "../../store/group/group.query";
import { Group } from "../../models/user-group";

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

  selectedUser$ = signal<User>(null);
  users$ = signal<User[]>(null);

  constructor(
    private dataService: UserDataService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private keycloakService: AuthenticationFactory,
    private groupQuery: GroupQuery,
  ) {
    if (!this.configService.hasCatAdminRights()) {
      this.availableRoles = this.availableRoles.filter(
        (o) => o.value != "cat-admin",
      );
    }
  }

  getUsers(): Observable<FrontendUser[]> {
    return this.dataService.getUsers().pipe(
      map((json: any[]) => json.map((item) => new FrontendUser(item))),
      map((users: FrontendUser[]) =>
        users
          .filter(
            // remove current user from list
            (u) => u.login !== this.configService.$userInfo.getValue().login,
          )
          .sort((a, b) => a.login.localeCompare(b.login)),
      ),
      tap((users) => this.users$.set(users ?? [])),
    );
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
      tap((user) =>
        this.users$.update((value) => {
          const index = value.findIndex((u) => u.id === user.id);
          value[index] = user;
          return [...value];
        }),
      ),
      catchError((error) => {
        if (error.status === 404) {
          throw new IgeError(
            "Es existiert kein Benutzer mit dem Login: " + user.login,
          );
        } else {
          throw error;
        }
      }),
    );
  }

  updateCurrentUser(user: Partial<User>): Observable<boolean> {
    return this.keycloakService
      .updateUserProfile(user)
      .pipe(catchError((error) => UserService.handleChangeEmailError(error)));
  }

  private static handleChangeEmailError(
    response: HttpErrorResponse,
  ): Observable<any> {
    if (
      response.status === 409 &&
      response.error.errorMessage === "emailExistsMessage"
    ) {
      throw new IgeError(
        "Diese E-Mail-Adresse wird bereits für einen anderen Benutzernamen verwendet.",
      );
    }

    throw response;
  }

  createUser(
    user: FrontendUser,
    isNewExternalUser: boolean,
  ): Observable<FrontendUser> {
    const userForBackend = <BackendUser>{
      ...user,
      groups: user.groups.map((group) => +group.key),
    };

    return this.dataService.createUser(userForBackend, isNewExternalUser).pipe(
      map((u) => new FrontendUser(u)),
      tap(() => {
        this.snackBar.open("Registrierungs-E-Mail wurde versandt", "", {
          panelClass: "green",
        });
      }),
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.dataService.deleteUser(userId);
  }

  getAssignedDatasets(userId: number): Observable<number[]> {
    return this.dataService.getAssignedDatasets(userId);
  }

  getExternalUsers(): Observable<BackendUser[]> {
    return this.dataService.getExternalUsers();
  }

  private getExternalUsersAsSelectOptions(
    users: BackendUser[],
  ): SelectOptionUi[] {
    return users.map((user) => {
      return new SelectOption(user.login, user.login);
    });
  }

  getUserFormFields(
    groups: Group[],
    groupClickCallback: (id: string) => void = undefined,
    roleChangeCallback: FormlyAttributeEvent = undefined,
  ): FormlyFieldConfig[] {
    console.log("get user form fields");
    return getUserFormFields(
      this.availableRoles,
      groups,
      groupClickCallback,
      roleChangeCallback,
    );
  }

  getNewUserFormFields(users: BackendUser[]): FormlyFieldConfig[] {
    return getNewUserFormFields(
      this.availableRoles,
      this.getExternalUsersAsSelectOptions(users),
      this.groupQuery.getAll().map((group) => {
        return new SelectOption(group.id.toString(), group.name);
      }),
    );
  }

  updatePassword(): Promise<void> {
    return this.keycloakService.updatePassword();
  }

  resetPassword(login: string) {
    return this.dataService.resetPassword(login);
  }
}
