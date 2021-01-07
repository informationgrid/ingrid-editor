import {Observable} from 'rxjs';
import {ConfigService, Configuration} from '../config/config.service';
import {HttpClient} from '@angular/common/http';
import {Role} from '../../models/user-role';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleDataService {

  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  getRoleMapping(id: string): Observable<any> {
    return this.http.get(this.configuration.backendUrl + 'groups/' + id);
  }

  saveRole(role: Role): Observable<any> {
    // TODO: after saving role reassign role to active user. Necessary? User should not edit his own role!!!
    return this.http.put(this.configuration.backendUrl + 'groups/' + role.name, role)
      .pipe(
        // catchError(err => this.errorService.handle(err))
      );
  }

  createRole(role: Role): Observable<any> {
    return this.http.post(this.configuration.backendUrl + 'groups/' + role.name, role)
      .pipe(
        // catchError(err => this.errorService.handle(err))
      );
  }

  // delete group metadata from backend
  deleteRole(id: string): Observable<any> {
    return this.http.delete(this.configuration.backendUrl + 'groups/' + name)
      .pipe(
        // catchError(err => this.errorService.handle(err))
      );

    // TODO: also delete from keycloak
    // this.apiService.removeGroup(id);
  }

  getGroups(): Observable<Role[]> {

    try {
      return this.http.get<Role[]>(this.configuration.backendUrl + 'groups');
    } catch (e) {
      console.error('Could not get groups');
      return Observable.create([]);
    }
  }

  getGroup(id: string): Observable<Role> {
    return this.http.get<Role>(this.configuration.backendUrl + 'groups/' + id);
  }

}
