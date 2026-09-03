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
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { ConfigService } from "../services/config/config.service";

@Injectable({ providedIn: "root" })
export class BffAuthInterceptor implements HttpInterceptor {
  private configService = inject(ConfigService);
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Always send credentials (cookies) to the backend for API and auth calls
    const isApiOrAuth =
      req.url.startsWith("/api/") ||
      req.url.startsWith("/auth/") ||
      req.url.includes("/api/");
    const request =
      isApiOrAuth && !req.withCredentials
        ? req.clone({ withCredentials: true })
        : req;

    return next.handle(request).pipe(
      catchError((error) => {
        if (error?.status === 401) {
          // Directly initiate login via the backend (full-page redirect)
          window.location.href =
            this.configService.getConfiguration().contextPath + "auth/login";
        }
        return throwError(() => error);
      }),
    );
  }
}
