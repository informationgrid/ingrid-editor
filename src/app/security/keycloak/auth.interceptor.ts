import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { KeycloakService } from './keycloak.service';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: KeycloakService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth header from the service.
    if (!this.auth.isInitialized()) {
      return next.handle(req);
    }
    const authHeaderPromise = this.auth.getToken();
    const authHeaderObservable = fromPromise(authHeaderPromise);

    return authHeaderObservable.flatMap(token => {
      const authReq = req.clone({headers: req.headers.set('Authorization', 'Bearer ' + token)});
      return next.handle(authReq);
    });
  }
}
