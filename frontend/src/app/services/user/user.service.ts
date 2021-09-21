import { Injectable } from "@angular/core";
import { BackendUser, FrontendUser, User } from "../../+user/user";
import { combineLatest, Observable } from "rxjs";
import { UserDataService } from "./user-data.service";
import { map } from "rxjs/operators";
import { SelectOptionUi } from "../codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { GroupService } from "../role/group.service";
import { getUserFormFields } from "../../+user/user/user.formly-fields";
import { getNewUserFormFields } from "../../+user/user/new-user-dialog/new-user.formly-fields";

@Injectable({
  providedIn: "root",
})
export class UserService {
  availableRoles: SelectOptionUi[] = [
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

  getCatAdmins(): Observable<FrontendUser[]> {
    return this.dataService
      .getCatAdmins()
      .pipe(map((json: any[]) => json.map((item) => new FrontendUser(item))));
  }

  /**
   * Get potential Managers for User
   *
   * These are all Catalog Admins + all MD-Admins visible by the editing admin.
   * Minus the User forUser himself and minus all Users underneath the User forUser
   *
   * If forGroup is True, the children and the User himself are not filtered out, as they are valid options.
   * @param forUser
   * @param forGroup
   */
  getPotentialManagers(
    forUser: User,
    forGroup: boolean = false
  ): Observable<FrontendUser[]> {
    const forUserId = forUser.login;
    const allUsers$ = this.getUsers();
    const catAdmins$ = this.getCatAdmins();
    const childrenOfUser$ = this.dataService
      .getUsersForUser(forUserId)
      .pipe(map((json: any[]) => json.map((item) => new FrontendUser(item))));

    return combineLatest(
      allUsers$,
      childrenOfUser$,
      catAdmins$,
      (allUsers, childrenOfUser, catAdmins) => ({
        allUsers,
        childrenOfUser,
        catAdmins,
      })
    ).pipe(
      map((pair) => {
        // all visible MD-Admins - target itself - target's children
        // + all Cat-Admins except if in targets children

        // allUsers + catAdmins without duplicates
        const eligibleManagers = pair.allUsers.concat(
          pair.catAdmins.filter(
            (admin) => !pair.allUsers.find((u) => admin.login == u.login)
          )
        );

        // filter out children, self and non admins
        return eligibleManagers.filter(
          (user) =>
            ["md-admin", "cat-admin"].includes(user.role) &&
            (forGroup || user.login !== forUserId) &&
            (forGroup ||
              !pair.childrenOfUser.find((u) => user.login == u.login))
        );
      })
    );
  }

  getManagedUsers(login: string): Observable<String[]> {
    return this.dataService.getManagedUserIds(login);
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

    return this.dataService
      .saveUser(userForBackend)
      .pipe(map((u) => new FrontendUser(u)));
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

  updateManager(userId: String, managerId: String): Observable<any> {
    return this.dataService.setManagerForUser(userId, managerId);
  }

  sendPasswordChangeRequest(login: string) {
    return this.dataService.sendPasswordChangeRequest(login);
  }

  getRoleIcon(role: string) {
    switch (true) {
      case role === "ige-super-admin":
      case role === "cat-admin":
        return "catalog-admin";
      case role.includes("admin"):
        return "meta-admin";
      default:
        return "author";
    }
  }
}
