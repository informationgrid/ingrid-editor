import { Observable } from "rxjs";
import { BackendUser, User } from "../../+user/user";
import { ConfigService, Configuration } from "../config/config.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class UserDataService {
  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  getUsers(): Observable<BackendUser[]> {
    return this.http.get<BackendUser[]>(
      this.configuration.backendUrl + "users"
    );
  }

  getCatAdmins(catalogId: String): Observable<BackendUser[]> {
    return this.http.get<BackendUser[]>(
      this.configuration.backendUrl + `users/admins/${catalogId}`
    );
  }

  saveUser(user: BackendUser): Observable<BackendUser> {
    return this.http.put<BackendUser>(
      this.configuration.backendUrl + "users",
      user
    );
  }

  saveCurrentUser(user: User): Observable<BackendUser> {
    return this.http.put<BackendUser>(
      this.configuration.backendUrl + "users/currentUser",
      user
    );
  }

  createUser(user: User, isNewExternalUser: boolean): Observable<BackendUser> {
    return this.http.post<BackendUser>(
      `${this.configuration.backendUrl}users?newExternalUser=${isNewExternalUser}`,
      user
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(this.configuration.backendUrl + "users/" + userId);
  }

  getUser(id: number): Observable<BackendUser> {
    return this.http.get<BackendUser>(
      this.configuration.backendUrl + "users/" + id
    );
  }

  getAssignedUsers(dbId: string): Observable<string[]> {
    return this.http.get<string[]>(
      this.configuration.backendUrl + "info/assignedUsers/" + dbId
    );
  }

  getExternalUsers() {
    return this.http.get<BackendUser[]>(
      this.configuration.backendUrl + "externalUsers"
    );
  }

  getAllUserIds() {
    return this.http.get<String[]>(
      this.configuration.backendUrl + "internalUsers"
    );
  }

  assignUserToCatalog(userId: string, catalogId: string) {
    return this.http.post<void>(
      this.configuration.backendUrl + `user/${userId}/assignCatalog`,
      catalogId
    );
  }

  sendPasswordChangeRequest(login: string) {
    return this.http.post<void>(
      this.configuration.backendUrl +
        "externalUsers/requestPasswordChange/" +
        login,
      null
    );
  }

  resetPassword(login: string) {
    return this.http.post<void>(
      this.configuration.backendUrl + "externalUsers/resetPassword/" + login,
      null
    );
  }
}
