import { KeycloakOptions } from "keycloak-angular";
import { AuthenticationService } from "./authentication.service";
import { HttpClient } from "@angular/common/http";

export class AuthMockService extends AuthenticationService {
  constructor(private http: HttpClient) {
    super();
  }

  refreshToken() {}

  logout() {}

  init(options: KeycloakOptions): Promise<any> {
    return Promise.resolve();
  }

  isLoggedIn(): Promise<boolean> {
    return this.login().then(() => true);
  }

  login(): Promise<any> {
    return this.http.get("/login", { responseType: "text" }).toPromise();
  }
}
