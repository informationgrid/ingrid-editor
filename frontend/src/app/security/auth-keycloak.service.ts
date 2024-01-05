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
import { KeycloakOptions, KeycloakService } from "keycloak-angular";
import { AuthenticationService } from "./authentication.service";
import { IgeError } from "../models/ige-error";
import { ModalService } from "../services/modal/modal.service";

export class AuthKeycloakService extends AuthenticationService {
  constructor(
    private keycloak: KeycloakService,
    private modalService: ModalService,
  ) {
    super();
  }

  refreshToken() {
    this.keycloak.updateToken().catch(() => {
      console.error("Token could not be updated");
      const error = new IgeError(
        "Die Session ist abgelaufen! Sie werden in 5 Sekunden zur Login-Seite geschickt.",
      );
      this.modalService.showIgeError(error);
      setTimeout(() => this.logout(), 5000);
    });
  }

  logout() {
    if (this.keycloak.getKeycloakInstance().idToken) {
      this.keycloak.logout();
    } else {
      this.keycloak.login();
    }
  }

  init(options: KeycloakOptions): Promise<any> {
    return this.keycloak.init(options);
  }

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }

  login() {
    return this.keycloak.login();
  }
}
