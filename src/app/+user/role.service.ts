import {Injectable} from '@angular/core';
import {ConfigService} from '../config/config.service';
import {Observable} from 'rxjs';
import {ErrorService} from '../services/error.service';
import {Role} from '../models/user-role';
import {Http} from '@angular/http';
import {ApiService} from '../services/ApiService';

@Injectable()
export class RoleService {

  public activeUserRoles: Role[];

  constructor(private http: Http, private configService: ConfigService, private apiService: ApiService,
              private errorService: ErrorService) {
  }

  getRoles(): Observable<Role[]> {
    return this.apiService.getGroups();
    // return this.http.get( this.configService.backendUrl + 'roles' )
    //   .map( resp => this.prepareRoles(resp.json()));
  }

  getRoleMapping(id: string): Observable<Role> {
    // return this.apiService.getGroup( id );
    return this.http.get( this.configService.backendUrl + 'roles/' + id)
      .map( resp => this.prepareRoles([resp.json()])[0] )
      .catch( err => this.errorService.handle(err));
  }

  prepareRoles(roles: any[]) {
    let result: Role[] = [];
    roles.forEach( role => {
      result.push( {
        id: role._id,
        name: role.name,
        pages: role.pages ? role.pages : [],
        attributes: role.attributes ? role.attributes : [],
        datasets: role.datasets ? role.datasets : []
      } );
    } );
    return result;
  }

  saveRole(role: Role): Observable<any> {
    // TODO: after saving role reassign role to active user. Necessary? User should not edit his own role!!!
    return this.http.put( this.configService.backendUrl + 'roles/' + role.name, role )
    // .map( resp => resp.json() )
      .catch( err => this.errorService.handle( err ) );
  }

  createRole(role: Role): Observable<any> {
    return this.http.post( this.configService.backendUrl + 'roles/' + role.name, role )
    // .map( resp => resp.json() )
      .catch( err => this.errorService.handle( err ) );
  }

  // delete group metadata from backend
  deleteRole(id: string): Observable<any> {
    return this.http.delete( this.configService.backendUrl + 'roles/' + name )
      .catch( err => this.errorService.handle( err ) );

    // TODO: also delete from keycloak
    // this.apiService.removeGroup(id);
  }

}
