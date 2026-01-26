/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { inject, Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Observable, Subscription, timer } from "rxjs";
import { scan, takeWhile } from "rxjs/operators";
import { ModalService } from "./modal/modal.service";
import { IgeError } from "../models/ige-error";
import { AuthenticationFactory } from "../security/auth.factory";
import { GeneralStore } from "../store/general.store";

@Injectable({
  providedIn: "root",
})
export class SessionTimeoutInterceptor implements HttpInterceptor {
  private generalStore = inject(GeneralStore);
  timer$: Subscription;
  private oneSecondInMilliseconds = 1000;

  constructor(
    private modalService: ModalService,
    private authFactory: AuthenticationFactory,
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request);
  }

  private resetSessionTimeout() {
    if (this.timer$) {
      this.timer$.unsubscribe();
    }

    /*const refreshToken = this.keycloak.getKeycloakInstance().refreshTokenParsed;
    if (!refreshToken) return;*/

    let duration = this.calculateDuration();
    this.updateStore(duration);

    this.timer$ = timer(0, this.oneSecondInMilliseconds)
      .pipe(
        scan((acc) => --acc, duration),
        takeWhile((x) => x >= -10),
      )
      .subscribe((time) => {
        if (time % 60 == 0 || time < 300) {
          duration = this.calculateDuration();
          this.updateStore(duration);
        }
      });
  }

  private calculateDuration() {
    return 999;
    /*const refreshToken = this.keycloak.getKeycloakInstance().refreshTokenParsed;
    if (!refreshToken) {
      this.updateStore(-1);
      return;
    }

    const endTime = refreshToken.exp;

    const now = Math.ceil(new Date().getTime() / 1000);
    return endTime - now;*/
  }

  private updateStore(time: number) {
    this.generalStore.setSessionTimeout(time);

    if (time <= 0) {
      const error = new IgeError(
        "Die Session ist abgelaufen! Sie werden in 5 Sekunden zur Login-Seite geschickt.",
      );
      this.modalService.showIgeError(error);
      setTimeout(() => this.authFactory.logout(), 5000);
      this.timer$.unsubscribe();
    }
  }
}
