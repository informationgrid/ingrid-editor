import { Injectable } from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { ModalService } from "../../services/modal/modal.service";
import { IgeError } from "../../models/ige-error";
import { KeycloakService } from "keycloak-angular";
import { AuthenticationFactory } from "../auth.factory";

@Injectable({
  providedIn: "root",
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: KeycloakService,
    private authFactory: AuthenticationFactory,
    private modalService: ModalService,
  ) {}

  // TODO: https://stackoverflow.com/questions/54925361/how-to-give-session-idle-timeout-in-angular-6

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // send the newly created request
    return next.handle(req).pipe(
      catchError((error) => {
        // if we have been logged out during a request then redirect to the start page
        // so that the keycloak login screen is shown
        if (!this.auth.isLoggedIn()) {
          const message =
            "Sie wurden abgemeldet und werden in 5 Sekunden zur Login-Seite geschickt.";
          this.showError(message);
          console.error(error);
          setTimeout(() => this.authFactory.get().logout(), 5000);
          return null;
        }
        this.showError(this.getMessage(error));
        console.log("Error Occurred", error);
        return throwError(error);
      }),
    );
  }

  private showError(message: string) {
    console.log(message);
    const loggedOutError = new IgeError();
    loggedOutError.setMessage(message);
    this.modalService.showIgeError(loggedOutError, true);
  }

  private getMessage(error: HttpErrorResponse): string {
    let errorText = error.error?.errorText ?? null;
    switch (errorText) {
      case "No access to referenced dataset":
        return "Der Datensatz enthält Referenzen, auf die Sie keine Berechtigungen haben.";
      case "No read access to document":
        return "Sie haben keine Berechtigung auf diesen Datensatz.";
      default:
        return "Sie haben keine Berechtigung für diese Aktion.";
    }
  }
}
