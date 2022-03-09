import { AuthKeycloakService } from "./auth-keycloak.service";
import { KeycloakService } from "keycloak-angular";
import { AuthMockService } from "./auth-mock.service";
import { HttpClient } from "@angular/common/http";
import { AuthenticationService } from "./authentication.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "../+user/user";

@Injectable({
  providedIn: "root",
})
export class AuthenticationFactory {
  auth: AuthenticationService;

  constructor(private keycloak: KeycloakService, private http: HttpClient) {}

  initWithKeycloak() {
    this.auth = new AuthKeycloakService(this.keycloak);
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

    return this.http.post(url, profile);
  }

  updatePassword() {
    return this.keycloak.login({ action: "UPDATE_PASSWORD" });
  }
}
