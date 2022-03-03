import { KeycloakOptions, KeycloakService } from "keycloak-angular";
import { AuthenticationService } from "./authentication.service";
import { IgeError } from "../models/ige-error";

export class AuthKeycloakService extends AuthenticationService {
  constructor(private keycloak: KeycloakService) {
    super();
  }

  refreshToken() {
    this.keycloak.updateToken(60).catch((error) => {
      console.error("Token could not be updated");
    });
  }

  logout() {
    this.keycloak.logout();
  }

  init(options: KeycloakOptions): Promise<any> {
    return this.keycloak.init(options);
  }

  isLoggedIn(): Promise<boolean> {
    return this.keycloak.isLoggedIn();
  }

  login() {
    return this.keycloak.login();
  }
}
