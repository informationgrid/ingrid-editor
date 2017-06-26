import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {ConfigService} from '../config/config.service';
import {ErrorService} from './error.service';
import {Http, Response} from '@angular/http';
import {KeycloakService} from '../keycloak/keycloak.service';
import {User} from '../+user/user';
import {Role} from '../models/user-role';

@Injectable()
export class ApiService {
  constructor(private http: Http, private configService: ConfigService,
              private errorService: ErrorService) {
  }

  getIsoDocument(id: number): Observable<any> {
    return this.http.get( this.configService.backendUrl + 'datasets/' + id + '/export/ISO' )
      .map( (result: Response) => {
        return result.text();
      } )
      .catch( error => this.errorService.handle( error ) );
  }

  getGroups(): Observable<Role[]> {
    return this.http.get( 'http://192.168.99.100:8080/auth/admin/realms/' + KeycloakService.auth.authz.realm + '/roles' )
      .map( response => response.json() )
      .map( (json: any[]) => {
        let result: Role[] = [];
        json.forEach( item => {
          result.push( {
            id: item.id,
            name: item.name,
            attributes: [],
            datasets: [],
            pages: null
          } );
        } );
        return result;
      } );
  }

  getUsers(): Observable<User[]> {
    return this.http.get( 'http://192.168.99.100:8080/auth/admin/realms/' + KeycloakService.auth.authz.realm + '/users' )
      .map( response => response.json() )
      .map( (json: any[]) => {
        let result: User[] = [];
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
    return this.http.get( 'http://192.168.99.100:8080/auth/admin/realms/' + KeycloakService.auth.authz.realm + '/users/' + id )
      .map( response => response.json() )
      .map( (json: any) => {
        let result: User = {
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
    return this.http.get( 'http://192.168.99.100:8080/auth/admin/realms/' + KeycloakService.auth.authz.realm + '/roles-by-id/' + id )
      .map( response => response.json() )
      .map( (json: any) => {
        let result: Role = {
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
