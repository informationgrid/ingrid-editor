import {Observable} from 'rxjs';
import {BackendUser, User} from '../../+user/user';
import {ConfigService, Configuration} from '../config/config.service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  getUsers(): Observable<BackendUser[]> {
    return this.http.get<BackendUser[]>(this.configuration.backendUrl + 'users');
  }

  saveUser(user: User): Observable<BackendUser> {
    return this.http.put<BackendUser>(this.configuration.backendUrl + 'users/' + user.login, user);
  }

  createUser(user: User): Observable<BackendUser> {
    return this.http.post<BackendUser>(this.configuration.backendUrl + 'users/' + user.login, user);
  }

  deleteUser(login: string): Observable<any> {
    return this.http.delete(this.configuration.backendUrl + 'users/' + login);
  }

  getUser(id: string): Observable<BackendUser> {
    return this.http.get<BackendUser>(this.configuration.backendUrl + 'users/' + id);
  }

  getAssignedUsers(dbId: string): Observable<string[]> {
    return this.http.get<string[]>(this.configuration.backendUrl + 'info/assignedUsers/' + dbId);
  }
}
