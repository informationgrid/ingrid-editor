import {Injectable} from '@angular/core';
import {ConfigService, Configuration} from '../config/config.service';
import {ErrorService} from '../error.service';
import {User} from '../../+user/user';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UserDataService} from './user-data.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private configuration: Configuration;

  constructor(private http: HttpClient, private configService: ConfigService,
              private errorService: ErrorService, private dataService: UserDataService) {
    this.configuration = configService.getConfiguration();
  }

  getUsers(): Observable<User[]> {
    return this.dataService.getUsers();
  }

  getUser(login: string): Observable<User> {
    return this.dataService.getUser(login);
  }

  saveUser(user: User): Observable<User> {
    return this.dataService.saveUser(user);
  }

  createUser(user: User): Observable<User> {
    return this.dataService.createUser(user);
  }

  deleteUser(login: string): Observable<any> {
    return this.dataService.deleteUser(login);
  }

  getAssignedUsers(dbId: string) {
    return this.dataService.getAssignedUsers(dbId);
  }
}
