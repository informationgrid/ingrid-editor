import {Observable} from 'rxjs';
import {ConfigService, Configuration} from '../config/config.service';
import {HttpClient} from '@angular/common/http';
import {Group} from '../../models/user-role';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleDataService {

  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  saveRole(role: Group): Observable<any> {
    // TODO: after saving role reassign role to active user. Necessary? User should not edit his own role!!!
    return this.http.put(this.configuration.backendUrl + 'groups/' + role.id, role);
  }

  createRole(role: Group): Observable<any> {
    return this.http.post(this.configuration.backendUrl + 'groups', role);
  }

  // delete group metadata from backend
  deleteRole(id: string): Observable<any> {
    return this.http.delete(this.configuration.backendUrl + 'groups/' + id);
  }

  getGroups(): Observable<Group[]> {

    try {
      return this.http.get<Group[]>(this.configuration.backendUrl + 'groups');
    } catch (e) {
      console.error('Could not get groups');
      return Observable.create([]);
    }
  }

  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(this.configuration.backendUrl + 'groups/' + id);
  }

}
