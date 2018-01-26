import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { KeycloakService } from './keycloak.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: KeycloakService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // send the newly created request
    return next.handle( req )
      .catch( (error, caught) => {
        debugger;
        // if we have been logged out during a request then redirect to the start page
        // so that the keycloak login screen is shown
        if (error.status === 403) {
          // TODO: redirect
          console.error( 'You do not have permission to this resource or are logged out' );
        } else if (error.url.indexOf( '/auth/realms/' ) !== -1) {
          // TODO: redirect
          console.log( 'We have been logged out. Redirecting to login page.' );
        }
        // intercept the respons error and displace it to the console
        console.log( 'Error Occurred' );
        console.log( error );
        // return the error to the method that called it
        return Observable.throw( error );
      } ) as any;

    //
    // // Get the auth header from the service.
    // if (!this.auth.isInitialized()) {
    //   return next.handle(req);
    // }
    // const authHeaderPromise = this.auth.getToken();
    // const authHeaderObservable = fromPromise(authHeaderPromise);
    //
    // return authHeaderObservable.flatMap(token => {
    //   const authReq = req.clone({headers: req.headers.set('Authorization', 'Bearer ' + token)});
    //   return next.handle(authReq);
    // });
  }
}
