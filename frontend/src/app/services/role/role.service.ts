import {Injectable} from '@angular/core';
import {ErrorService} from '../error.service';
import {Group} from '../../models/user-role';
import {Observable} from 'rxjs';
import {RoleDataService} from './role-data.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private dataService: RoleDataService) {
  }

  getGroups(): Observable<Group[]> {
    return this.dataService.getGroups();
  }

  getGroup(id: string): Observable<Group> {
    return this.dataService.getGroup(id)
      .pipe(
        map(json => this.prepareGroup([json])[0])
      );
  }

  prepareGroup(groups: any[]) {
    return groups.map(group => new Group(group));
  }

  updateGroup(role: Group): Observable<any> {
    // TODO: after saving role reassign role to active user. Necessary? User should not edit his own role!!!
    return this.dataService.saveRole(role);
  }

  createGroup(role: Group): Observable<any> {
    return this.dataService.createRole(role);
  }

  // delete group metadata from backend
  deleteGroup(id: string): Observable<any> {
    return this.dataService.deleteRole(id);

    // TODO: also delete from keycloak
    // this.apiService.removeGroup(id);
  }

}
