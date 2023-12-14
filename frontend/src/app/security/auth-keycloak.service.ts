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
