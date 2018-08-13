import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { KeycloakService } from './keycloak.service';
import { catchError } from 'rxjs/internal/operators';
import { Observable, throwError } from 'rxjs/index';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: KeycloakService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // send the newly created request
    return next.handle( req )
      .pipe(
        /*catchError( (error, caught) => {
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
          return throwError( error );
          // throw error;
        } )*/
      );

  }
}
