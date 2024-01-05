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
import { Observable, of } from "rxjs";
import { ConfigService, Configuration } from "../config/config.service";
import { HttpClient } from "@angular/common/http";
import { FrontendGroup, Group, UserResponse } from "../../models/user-group";
import { Injectable } from "@angular/core";
import { User } from "../../+user/user";

@Injectable({
  providedIn: "root",
})
export class GroupDataService {
  private configuration: Configuration;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  saveGroup(role: Group): Observable<any> {
    // TODO: after saving role reassign role to active user. Necessary? User should not edit his own role!!!
    return this.http.put(
      this.configuration.backendUrl + "groups/" + role.id,
      role,
    );
  }

  createGroup(role: Group): Observable<Group> {
    return this.http.post<Group>(
      this.configuration.backendUrl + "groups",
      role,
    );
  }

  // delete group metadata from backend
  deleteGroup(id: number): Observable<any> {
    return this.http.delete(this.configuration.backendUrl + "groups/" + id);
  }

  getGroups(): Observable<FrontendGroup[]> {
    try {
      return this.http.get<FrontendGroup[]>(
        this.configuration.backendUrl + "groups",
      );
    } catch (e) {
      console.error("Could not get groups");
      return of([]);
    }
  }

  getGroup(id: number): Observable<FrontendGroup> {
    return this.http.get<FrontendGroup>(
      this.configuration.backendUrl + "groups/" + id,
    );
  }

  getGroupManager(id: number): Observable<User> {
    return this.http.get<User>(
      this.configuration.backendUrl + "groups/" + id + "/manager",
    );
  }

  updateGroupManager(id: number, managerId: string): Observable<User> {
    return this.http.post<User>(
      this.configuration.backendUrl + "groups/" + id + "/manager",
      managerId,
    );
  }

  getUserResponseOfGroup(id: number): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(
      this.configuration.backendUrl + "groups/" + id + "/users",
    );
  }
}
