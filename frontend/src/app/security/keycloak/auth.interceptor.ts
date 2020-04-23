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

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // send the newly created request
    return next.handle(req)
      .pipe(
        catchError((error, caught) => {
          // if we have been logged out during a request then redirect to the start page
          // so that the keycloak login screen is shown
          if (error.status === 403) {
            // TODO: redirect?
            const message = 'You do not have permission to this resource or are logged out';
            this.showError(message);
          } else if (error.url.indexOf('/auth/realms/') !== -1) {
            const message = 'You have been logged out. Redirecting to login page in 3 seconds.';
            this.showError(message);
            setTimeout(() => window.location.reload(), 3000);
          }
          // intercept the respons error and displace it to the console
          console.log('Error Occurred');
          console.log(error);
          // return the error to the method that called it
          return throwError(error);
          // throw error;
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
