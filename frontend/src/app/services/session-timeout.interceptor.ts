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
  HttpClient,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { firstValueFrom, Observable, Subscription, timer } from "rxjs";
import { map, takeWhile } from "rxjs/operators";
import { ModalService } from "./modal/modal.service";
import { IgeError } from "../models/ige-error";
import { GeneralStore } from "../store/general.store";
import { ConfigService } from "./config/config.service";

@Injectable({
  providedIn: "root",
})
export class SessionTimeoutInterceptor implements HttpInterceptor {
  private generalStore = inject(GeneralStore);
  private configService = inject(ConfigService);
  private http = inject(HttpClient);

  timer$: Subscription;
  private oneSecondInMilliseconds = 1000;
  private lastReset = 0;

  constructor(private modalService: ModalService) {
    window.addEventListener("storage", (event) => {
      if (event.key === "ige-session-last-reset" && event.newValue) {
        const lastReset = parseInt(event.newValue, 10);
        if (lastReset > this.lastReset) {
          this.lastReset = lastReset;
          this.calculateDuration().then((duration) => {
            this.startTimer(duration);
          });
        }
      }
    });
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const isApiCall =
      request.url.includes("/api/") && !request.url.includes("/api/config");

    if (isApiCall) {
      this.resetSessionTimeout();
    }

    return next.handle(request);
  }

  private resetSessionTimeout() {
    const now = Date.now();
    if (now - this.lastReset < 5000) return; // 5 seconds throttle
    this.lastReset = now;
    localStorage.setItem("ige-session-last-reset", now.toString());

    this.calculateDuration().then((duration) => {
      this.startTimer(duration);
    });
  }

  private startTimer(duration: number) {
    if (this.timer$) {
      this.timer$.unsubscribe();
    }

    this.updateStore(duration);
    if (duration <= 0) return;

    const endTime = Date.now() + duration * 1000;

    this.timer$ = timer(1000, this.oneSecondInMilliseconds)
      .pipe(
        map(() => Math.round((endTime - Date.now()) / 1000)),
        takeWhile((x) => x >= -10),
      )
      .subscribe((time) => {
        this.updateStore(time);
      });
  }

  private async calculateDuration(): Promise<number> {
    const config = this.configService.getConfiguration();
    return config?.sessionTimeout ?? 1800;
  }

  private updateStore(time: number) {
    const previousTime = this.generalStore.sessionTimeoutIn();
    this.generalStore.setSessionTimeout(time);

    if (time <= 0 && time !== -1 && (previousTime > 0 || previousTime === -1)) {
      const error = new IgeError(
        "Die Session ist abgelaufen! Sie werden in 5 Sekunden zur Login-Seite geschickt.",
      );
      this.modalService.showIgeError(error);
      setTimeout(async () => {
        const config = this.configService.getConfiguration();
        // the session refresh call should end in a 401-error and automatically redirect to login
        const response = await firstValueFrom(
          this.http.get<{ remaining: number }>(
            config.backendUrl + "info/refreshSession",
          ),
        );
        console.log("Remaining: ", response.remaining);
      }, 5000);
      if (this.timer$) {
        this.timer$.unsubscribe();
      }
    }
  }
}
