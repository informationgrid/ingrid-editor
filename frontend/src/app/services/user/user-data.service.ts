/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  getUsers(): Observable<BackendUser[]> {
    return this.http.get<BackendUser[]>(
      this.configuration.backendUrl + "users",
    );
  }

  getCatAdmins(catalogId: String): Observable<BackendUser[]> {
    return this.http.get<BackendUser[]>(
      this.configuration.backendUrl + `users/admins/${catalogId}`,
    );
  }

  saveUser(user: BackendUser): Observable<BackendUser> {
    return this.http.put<BackendUser>(
      this.configuration.backendUrl + "users",
      user,
    );
  }

  saveCurrentUser(user: User): Observable<BackendUser> {
    return this.http.put<BackendUser>(
      this.configuration.backendUrl + "users/currentUser",
      user,
    );
  }

  createUser(user: User, isNewExternalUser: boolean): Observable<BackendUser> {
    return this.http.post<BackendUser>(
      `${this.configuration.backendUrl}users?newExternalUser=${isNewExternalUser}`,
      user,
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(this.configuration.backendUrl + "users/" + userId);
  }

  transferResponsibility(
    oldUserId: number,
    newUserId: number,
  ): Observable<any> {
    return this.http.get(
      this.configuration.backendUrl +
        `users/transferResponsibilities/${oldUserId}/${newUserId}`,
    );
  }

  getUser(id: number): Observable<BackendUser> {
    return this.http.get<BackendUser>(
      this.configuration.backendUrl + "users/" + id,
    );
  }

  getUserFullName(id: number): Observable<any> {
    return this.http.get(
      this.configuration.backendUrl + `users/${id}/fullname`,
      { responseType: "text" },
    );
  }

  getAssignedUsers(dbId: string): Observable<string[]> {
    return this.http.get<string[]>(
      this.configuration.backendUrl + "info/assignedUsers/" + dbId,
    );
  }

  getAssignedDatasets(userId: number): Observable<number[]> {
    return this.http.get<number[]>(
      this.configuration.backendUrl + `users/${userId}/responsibilities`,
    );
  }

  getExternalUsers() {
    return this.http.get<BackendUser[]>(
      this.configuration.backendUrl + "externalUsers",
    );
  }

  getAllUserIds() {
    return this.http.get<String[]>(
      this.configuration.backendUrl + "internalUsers",
    );
  }

  assignUserToCatalog(userId: string, catalogId: string) {
    return this.http.post<void>(
      this.configuration.backendUrl + `user/${userId}/assignCatalog`,
      catalogId,
    );
  }

  sendPasswordChangeRequest(login: string) {
    return this.http.post<void>(
      this.configuration.backendUrl +
        "externalUsers/requestPasswordChange/" +
        login,
      null,
    );
  }

  resetPassword(login: string) {
    return this.http.post<void>(
      this.configuration.backendUrl + "externalUsers/resetPassword/" + login,
      null,
    );
  }
}
