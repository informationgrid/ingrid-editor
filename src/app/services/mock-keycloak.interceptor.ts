import { Observable } from 'rxjs/Observable';
import {
  HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class MockKeycloakInterceptor implements HttpInterceptor {

  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // array in local storage for registered users
    // const users: any[] = JSON.parse( localStorage.getItem( 'users' ) ) || [];

    // wrap in delayed observable to simulate server api call
    return Observable.of( null ).mergeMap( () => {

      // authenticate
      if (request.url.endsWith( '/api/users' ) && request.method === 'GET') {
        const body = [
          {
            id: 'ige',
            username: 'ige',
            firstName: 'Heinrich',
            lastName: 'Meier',
            roles: [],
            attributes: []
          }, {
            id: 'user1',
            username: 'user1',
            firstName: 'Michael',
            lastName: 'Sturm'
          }
        ];
        return Observable.of( new HttpResponse( {status: 200, body: body} ) );
      } else if (request.url.endsWith( '/api/users/ige' ) && request.method === 'GET') {
        const body = {
          id: 'ige',
          username: 'ige',
          firstName: 'Heinrich',
          lastName: 'Meier',
          roles: [],
          attributes: []
        };
        return Observable.of( new HttpResponse( {status: 200, body: body} ) );
      } else if (request.url.endsWith( '/api/groups' ) && request.method === 'GET') {
        const body = [
          {
            id: 'admin',
            name: 'Administrator'
          }, {
            id: 'user',
            name: 'User'
          }, {
            id: 'superuser',
            name: 'Super User'
          }
        ];
        return Observable.of( new HttpResponse( {status: 200, body: body} ) );
      }

      // pass through any requests not handled above
      return next.handle( request );

    } );
  }
}

export let mockKeycloakProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: MockKeycloakInterceptor,
  multi: true
};
