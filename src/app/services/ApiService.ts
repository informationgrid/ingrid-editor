import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {ErrorService} from './error.service';
import {Http, Response} from '@angular/http';
import {KeycloakService} from '../keycloak/keycloak.service';
import {User} from '../+user/user';
import {Role} from '../models/user-role';
import {environment} from '../../environments/environment';


@Injectable()
export class ApiService {
  constructor(private http: Http,
              private errorService: ErrorService) {
  }

  getIsoDocument(id: number): Observable<any> {
    return this.http.get( environment.backendUrl + 'datasets/' + id + '/export/ISO' )
      .map( (result: Response) => {
        return result.text();
      } )
      .catch( error => this.errorService.handle( error ) );
  }

  getGroups(): Observable<Role[]> {
    // return this.http.get( environment.keykloakBaseUrl + 'admin/realms/' + KeycloakService.auth.authz.realm + '/clients?clientId=ige-ng') ///7556e61a-4520-4f2a-b4d7-f948b3ad943b/roles' )
    const promise = new Promise((resolve) => {


      this.http.get( environment.keykloakBaseUrl + 'admin/realms/' + KeycloakService.auth.authz.realm + '/clients?clientId=ige-ng' )
        .map( res => res.json() )
        .map( client => {
          this.http.get( environment.keykloakBaseUrl + 'admin/realms/' + KeycloakService.auth.authz.realm + '/clients/' + client[0].id + '/roles' )
            .map( response => response.json() )
            .map( (json: any[]) => {
              const result: Role[] = [];
              json.forEach( item => {
                result.push( {
                  id: item.id,
                  name: item.name,
                  attributes: [],
                  datasets: [],
                  pages: null
                } );
              } );
              resolve(result);
            } ).subscribe();
        } ).subscribe();

    });
    return Observable.fromPromise(promise);
  }

  getUsers(): Observable<User[]> {
    return this.http.get( environment.keykloakBaseUrl + 'admin/realms/' + KeycloakService.auth.authz.realm + '/users' )
      .map( response => response.json() )
      .map( (json: any[]) => {
        const result: User[] = [];
        json.forEach( item => {
          result.push( {
            id: item.id,
            login: item.username,
            firstName: item.firstName,
            lastName: item.lastName,
            roles: item.roles,
            attributes: item.attributes
          } );
        } );
        return result;
      } );
  }

  getUser(id: string): Observable<User> {
    return this.http.get( environment.keykloakBaseUrl + 'admin/realms/' + KeycloakService.auth.authz.realm + '/users/' + id )
      .map( response => response.json() )
      .map( (json: any) => {
        const result: User = {
          id: json.id,
          login: json.username,
          firstName: json.firstName,
          lastName: json.lastName,
          roles: json.roles,
          attributes: json.attributes
        };
        return result;
      } );
  }

  getGroup(id: string): Observable<Role> {
    return this.http.get( environment.keykloakBaseUrl + 'admin/realms/' + KeycloakService.auth.authz.realm + '/roles-by-id/' + id )
      .map( response => response.json() )
      .map( (json: any) => {
        const result: Role = {
          id: json.id,
          name: '?',
          attributes: [],
          datasets: [],
          pages: null
        };
        return result;
      } );
  }
}
