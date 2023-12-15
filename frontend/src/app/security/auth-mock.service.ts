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
import { KeycloakOptions } from "keycloak-angular";
import { AuthenticationService } from "./authentication.service";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

export class AuthMockService extends AuthenticationService {
  constructor(private http: HttpClient) {
    super();
  }

  refreshToken() {}

  logout() {}

  init(options: KeycloakOptions): Promise<any> {
    return Promise.resolve();
  }

  isLoggedIn(): boolean {
    return true;
  }

  login(): Promise<any> {
    return firstValueFrom(this.http.get("/login", { responseType: "text" }));
  }
}
