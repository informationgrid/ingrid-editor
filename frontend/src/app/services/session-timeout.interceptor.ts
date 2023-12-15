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
import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Observable, Subscription, timer } from "rxjs";
import { filter, scan, take, takeWhile } from "rxjs/operators";
import { SessionStore } from "../store/session.store";
import { ModalService } from "./modal/modal.service";
import { IgeError } from "../models/ige-error";
import { ApiService } from "./ApiService";
import { KeycloakEventType, KeycloakService } from "keycloak-angular";
import { StorageService } from "../../storage.service";
import { AuthenticationFactory } from "../security/auth.factory";

@Injectable({
  providedIn: "root",
})
export class SessionTimeoutInterceptor implements HttpInterceptor {
  timer$: Subscription;
  private oneSecondInMilliseconds = 1000;

  constructor(
    private session: SessionStore,
    private modalService: ModalService,
    private apiService: ApiService,
    private keycloak: KeycloakService,
    private authFactory: AuthenticationFactory,
    private storageService: StorageService,
  ) {
    this.initListener();
    this.keycloak.keycloakEvents$
      .pipe(
        filter((item) => item.type === KeycloakEventType.OnAuthSuccess),
        take(1),
      )
      .subscribe(() => this.resetSessionTimeout());
  }

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
    const refreshToken = this.keycloak.getKeycloakInstance().refreshTokenParsed;
    if (!refreshToken) {
      this.updateStore(-1);
      return;
    }

    const endTime = refreshToken.exp;

    const now = Math.ceil(new Date().getTime() / 1000);
    return endTime - now;
  }

  private updateStore(time: number) {
    this.session.update({
      sessionTimeoutIn: time,
    });

    if (time <= 0) {
      const error = new IgeError(
        "Die Session ist abgelaufen! Sie werden in 5 Sekunden zur Login-Seite geschickt.",
      );
      this.modalService.showIgeError(error);
      setTimeout(() => this.authFactory.get().logout(), 5000);
      this.timer$.unsubscribe();
    }
  }

  private initListener() {
    this.storageService.changes
      .pipe(
        filter((item) => item.key === "ige-refresh-token"),
        takeWhile((item) => item.value !== null),
      )
      .subscribe((data) => {
        console.debug("Token in LocalStorage has changed", data);
        if (!data.value) {
          this.storageService.clear("ige-refresh-token");
          this.authFactory.get().logout();
          return;
        }
        this.keycloak.getKeycloakInstance().refreshToken = data.value;
        this.keycloak.getKeycloakInstance().refreshTokenParsed =
          this.decodeToken(data.value);

        this.resetSessionTimeout();
      });

    this.keycloak.keycloakEvents$
      .pipe(
        filter((item) => item.type === KeycloakEventType.OnAuthRefreshSuccess),
      )
      .subscribe(() => {
        this.storageService.store(
          "ige-refresh-token",
          this.keycloak.getKeycloakInstance().refreshToken,
        );
      });
  }

  private decodeToken(str) {
    str = str.split(".")[1];

    str = str.replace(/-/g, "+");
    str = str.replace(/_/g, "/");
    switch (str.length % 4) {
      case 0:
        break;
      case 2:
        str += "==";
        break;
      case 3:
        str += "=";
        break;
      default:
        throw "Invalid token";
    }

    str = decodeURIComponent(escape(atob(str)));

    str = JSON.parse(str);
    return str;
  }
}
