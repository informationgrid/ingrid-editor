import { Injectable } from "@angular/core";
import { BackendUser, FrontendUser, User } from "../../+user/user";
import { BehaviorSubject, Observable } from "rxjs";
import { UserDataService } from "./user-data.service";
import { catchError, map } from "rxjs/operators";
import { SelectOptionUi } from "../codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { GroupService } from "../role/group.service";
import { getUserFormFields } from "../../+user/user/user.formly-fields";
import { getNewUserFormFields } from "../../+user/user/new-user-dialog/new-user.formly-fields";
import { ConfigService } from "../config/config.service";
import { IgeError } from "../../models/ige-error";

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
    private configService: ConfigService
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

  updateCurrentUser(user: User): Observable<FrontendUser> {
    return this.dataService
      .saveCurrentUser(user)
      .pipe(map((u) => new FrontendUser(u)));
  }

  createUser(user: User, isNewExternalUser: boolean): Observable<FrontendUser> {
    return this.dataService
      .createUser(user, isNewExternalUser)
      .pipe(map((u) => new FrontendUser(u)));
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
    groupClickCallback: (id: number) => void = undefined
  ): FormlyFieldConfig[] {
    return getUserFormFields(
      this.availableRoles,
      this.groupService.getGroups(),
      groupClickCallback
    );
  }

  getNewUserFormFields(): FormlyFieldConfig[] {
    return getNewUserFormFields(
      this.availableRoles,
      this.getExternalUsersAsSelectOptions()
    );
  }

  sendPasswordChangeRequest(login: string) {
    return this.dataService.sendPasswordChangeRequest(login);
  }
}
