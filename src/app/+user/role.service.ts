import { Injectable } from '@angular/core';
import { ConfigService, Configuration } from '../services/config.service';
import { ErrorService } from '../services/error.service';
import { Role } from '../models/user-role';
import { ApiService } from '../services/ApiService';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/internal/operators';
import { Observable } from 'rxjs';

@Injectable()
export class RoleService {

  public activeUserRoles: Role[];
  private configuration: Configuration;

  constructor(private http: HttpClient, private configService: ConfigService, private apiService: ApiService,
              private errorService: ErrorService) {
    this.configuration = configService.getConfiguration();
  }

  getRoles(): Observable<Role[]> {
    return this.apiService.getGroups();
  }

  getRoleMapping(id: string): Observable<Role> {
    // return this.apiService.getGroup( id );
    return this.http.get(this.configuration.backendUrl + 'roles/' + id)
      .pipe(
        map(json => this.prepareRoles([json])[0])
        // catchError(err => this.errorService.handle(err))
      );
  }

  prepareRoles(roles: any[]) {
    const result: Role[] = [];
    roles.forEach(role => {
      result.push({
        id: role._id,
        name: role.name,
        pages: role.pages ? role.pages : [],
        attributes: role.attributes ? role.attributes : [],
        datasets: role.datasets ? role.datasets : []
      });
    });
    return result;
  }

  saveRole(role: Role): Observable<any> {
    // TODO: after saving role reassign role to active user. Necessary? User should not edit his own role!!!
    return this.http.put(this.configuration.backendUrl + 'roles/' + role.name, role)
      .pipe(
        // catchError(err => this.errorService.handle(err))
      );
  }

  createRole(role: Role): Observable<any> {
    return this.http.post(this.configuration.backendUrl + 'roles/' + role.name, role)
      .pipe(
        // catchError(err => this.errorService.handle(err))
      );
  }

  // delete group metadata from backend
  deleteRole(id: string): Observable<any> {
    return this.http.delete(this.configuration.backendUrl + 'roles/' + name)
      .pipe(
        // catchError(err => this.errorService.handle(err))
      );

    // TODO: also delete from keycloak
    // this.apiService.removeGroup(id);
  }

}
