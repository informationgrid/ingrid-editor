import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {KeycloakService} from './keycloak.service';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ModalService} from '../../services/modal/modal.service';
import {IgeError} from '../../models/ige-error';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: KeycloakService, private modalService: ModalService) {
  }

  // TODO: https://stackoverflow.com/questions/54925361/how-to-give-session-idle-timeout-in-angular-6

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // send the newly created request
    return next.handle(req)
      .pipe(
        catchError((error) => {
          // if we have been logged out during a request then redirect to the start page
          // so that the keycloak login screen is shown
          if (error.status === 403) {
            // TODO: redirect?
            const message = 'You do not have permission to this resource or are logged out';
            this.showError(message);
          } else if (error.status === 401) {
            const message = 'Sie wurden abgemeldet und werden in 5 Sekunden zur Login-Seite geschickt.';
            this.showError(message);
            console.error(error);
            setTimeout(() => window.location.reload(), 5000);
          }
          // intercept the response error and displace it to the console
          console.log('Error Occurred', error);

          // return the error to the method that called it
          return throwError(error);
        })
      );

  }

  private showError(message: string) {
    console.log(message);
    const loggedOutError = new IgeError();
    loggedOutError.setMessage(message)
    this.modalService.showIgeError(loggedOutError);
  }
}
