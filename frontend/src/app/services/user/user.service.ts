import { Injectable } from "@angular/core";
import { FrontendUser, User } from "../../+user/user";
import { Observable } from "rxjs";
import { UserDataService } from "./user-data.service";
import { map } from "rxjs/operators";
import { SelectOption } from "../codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { GroupService } from "../role/group.service";
import { getUserFormFields } from "../../+user/user/user.formly-fields";
import { getNewUserFormFields } from "../../+user/user/new-user-dialog/new-user.formly-fields";

@Injectable({
  providedIn: "root",
})
export class UserService {
  availableRoles: SelectOption[] = [
    { label: "Katalog-Administrator", value: "cat-admin" },
    { label: "Metadaten-Administrator", value: "md-admin" },
    { label: "Autor", value: "author" },
  ];

  constructor(
    private dataService: UserDataService,
    private groupService: GroupService
  ) {}

  getUsers(): Observable<FrontendUser[]> {
    return this.dataService
      .getUsers()
      .pipe(map((json: any[]) => json.map((item) => new FrontendUser(item))));
  }

  getUser(login: string): Observable<FrontendUser> {
    return this.dataService
      .getUser(login)
      .pipe(map((user) => new FrontendUser(user)));
  }

  updateUser(user: User): Observable<FrontendUser> {
    return this.dataService
      .saveUser(user)
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

  getExternalUsers(): Observable<FrontendUser[]> {
    return this.dataService.getExternalUsers();
  }

  getUserFormFields(): FormlyFieldConfig[] {
    return getUserFormFields(
      this.availableRoles,
      this.groupService.getGroups()
    );
  }

  getNewUserFormFields(): FormlyFieldConfig[] {
    return getNewUserFormFields(
      this.availableRoles,
      this.getExternalUsers().pipe(
        map((users) =>
          users.map((user) => {
            return { label: user.login, value: user.login };
          })
        )
      )
    );
  }
}
