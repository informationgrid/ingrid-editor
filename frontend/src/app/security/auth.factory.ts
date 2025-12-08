/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { User } from "../+user/user";

@Injectable({
  providedIn: "root",
})
export class AuthenticationFactory {
  constructor(private http: HttpClient) {}

  updateUserProfile(profile: Partial<User>): Observable<any> {
    // TODO: adapt
    return of();
    /*const url = this.keycloak
      .getKeycloakInstance()
      .createAccountUrl()
      .split("?")[0];

    return this.http.get(url).pipe(
      map((existingProfile) => ({ ...existingProfile, ...profile })),
      switchMap((updatedProfile) => this.http.post(url, updatedProfile)),
    );*/
  }

  updatePassword() {
    // return this.keycloak.login({ action: "UPDATE_PASSWORD" });
    // TODO: adapt
    return Promise.resolve();
  }

  logout() {
    // TODO: implement
  }

  refreshToken() {
    // TODO: implement
  }
}
