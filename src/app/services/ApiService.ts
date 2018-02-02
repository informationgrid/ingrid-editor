import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ConfigService, Configuration } from './config.service';
import { ErrorService } from './error.service';
import { KeycloakService } from '../security/keycloak/keycloak.service';
import { User } from '../+user/user';
import { Role } from '../models/user-role';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class ApiService {

  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService,
              private errorService: ErrorService) {
    this.configuration = configService.getConfiguration();
  }

  getIsoDocument(id: number): Observable<any> {
    return this.http.get( this.configuration.backendUrl + 'datasets/' + id + '/export/ISO', {responseType: 'text'} )
      .catch( error => this.errorService.handle( error ) );
  }

  getGroups(): Observable<Role[]> {

    return this.http.get( this.configuration.keykloakBaseUrl + 'admin/realms/' + KeycloakService.auth.authz.realm +
                      '/clients?clientId=ige-ng' )
        .flatMap( client => {
          return this.http.get( this.configuration.keykloakBaseUrl + 'admin/realms/' + KeycloakService.auth.authz.realm +
                          '/clients/' + client[0].id + '/roles' )
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
              return result;
            } )
        } );
  }

  getUsers(): Observable<User[]> {
    return this.http.get( 'http://localhost:8550/api/users' )
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
    return this.http.get( this.configuration.keykloakBaseUrl + 'admin/realms/' + KeycloakService.auth.authz.realm + '/users/' + id )
      .map( (json: any) => {
        return {
          id: json.id,
          login: json.username,
          firstName: json.firstName,
          lastName: json.lastName,
          roles: json.roles,
          attributes: json.attributes
        };
      } );
  }

  getGroup(id: string): Observable<Role> {
    return this.http.get( this.configuration.keykloakBaseUrl + 'admin/realms/' + KeycloakService.auth.authz.realm + '/roles-by-id/' + id )
      .map( (json: any) => {
        return {
          id: json.id,
          name: '?',
          attributes: [],
          datasets: [],
          pages: null
        };
      } );
  }
}
