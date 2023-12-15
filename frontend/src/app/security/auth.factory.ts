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
import { AuthKeycloakService } from "./auth-keycloak.service";
import { KeycloakService } from "keycloak-angular";
import { AuthMockService } from "./auth-mock.service";
import { HttpClient } from "@angular/common/http";
import { AuthenticationService } from "./authentication.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "../+user/user";
import { ModalService } from "../services/modal/modal.service";
import { map, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthenticationFactory {
  auth: AuthenticationService;

  constructor(
    private keycloak: KeycloakService,
    private http: HttpClient,
    private modalService: ModalService,
  ) {}

  initWithKeycloak() {
    this.auth = new AuthKeycloakService(this.keycloak, this.modalService);
  }

  initWithoutKeycloak() {
    this.auth = new AuthMockService(this.http);
  }

  get(): AuthenticationService {
    return this.auth;
  }

  updateUserProfile(profile: Partial<User>): Observable<any> {
    const url = this.keycloak
      .getKeycloakInstance()
      .createAccountUrl()
      .split("?")[0];

    return this.http.get(url).pipe(
      map((existingProfile) => ({ ...existingProfile, ...profile })),
      switchMap((updatedProfile) => this.http.post(url, updatedProfile)),
    );
  }

  updatePassword() {
    return this.keycloak.login({ action: "UPDATE_PASSWORD" });
  }
}
