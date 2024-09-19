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
import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { ModalService } from "../../services/modal/modal.service";
import { IgeError } from "../../models/ige-error";
import { AuthenticationFactory } from "../auth.factory";

@Injectable({
  providedIn: "root",
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(
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
        if (!this.authFactory.get().isLoggedIn()) {
          const message =
            "Sie wurden abgemeldet und werden in 5 Sekunden zur Login-Seite geschickt.";
          this.showError(message);
          console.error(error);
          setTimeout(() => this.authFactory.get().logout(), 5000);
          return null;
        }

        console.error("Error Occurred", error);
        return throwError(() => error);
      }),
    );
  }

  private showError(message: string) {
    console.error(message);
    const loggedOutError = new IgeError();
    loggedOutError.setMessage(message);
    this.modalService.showIgeError(loggedOutError, true);
  }
}
