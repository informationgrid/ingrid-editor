import { AuthKeycloakService } from "./auth-keycloak.service";
import { KeycloakService } from "keycloak-angular";
import { AuthMockService } from "./auth-mock.service";
import { HttpClient } from "@angular/common/http";
import { AuthenticationService } from "./authentication.service";
import { Injectable } from "@angular/core";

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
}
