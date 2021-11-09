import { KeycloakOptions } from "keycloak-angular";

export abstract class AuthenticationService {
  abstract init(options: KeycloakOptions): Promise<any>;
  abstract isLoggedIn(): Promise<boolean>;
  abstract refreshToken();
  abstract login(): Promise<any>;
  abstract logout();
}
