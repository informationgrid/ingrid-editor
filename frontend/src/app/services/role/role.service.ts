import {Injectable} from '@angular/core';
import {ErrorService} from '../error.service';
import {Role} from '../../models/user-role';
import {Observable} from 'rxjs';
import {RoleDataService} from './role-data.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  public activeUserRoles: Role[];

  constructor(private dataService: RoleDataService,
              private errorService: ErrorService) {
  }

  getRoles(): Observable<Role[]> {
    return this.dataService.getGroups();
  }

  getRoleMapping(id: string): Observable<Role> {
    // return this.apiService.getGroup( id );
    return this.dataService.getRoleMapping(id)
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
    return this.dataService.saveRole(role)
      .pipe(
        // catchError(err => this.errorService.handle(err))
      );
  }

  createRole(role: Role): Observable<any> {
    return this.dataService.createRole(role)
      .pipe(
        // catchError(err => this.errorService.handle(err))
      );
  }

  // delete group metadata from backend
  deleteRole(id: string): Observable<any> {
    return this.dataService.deleteRole(id)
      .pipe(
        // catchError(err => this.errorService.handle(err))
      );

    // TODO: also delete from keycloak
    // this.apiService.removeGroup(id);
  }

}
