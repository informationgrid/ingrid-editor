import { Injectable } from '@angular/core';
import { ConfigService, Configuration } from '../config/config.service';
import { ErrorService } from '../services/error.service';
import { User } from './user';
import { ApiService } from '../services/ApiService';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserService {
  private configuration: Configuration;

  constructor(private http: HttpClient, private configService: ConfigService,
              private errorService: ErrorService, private apiService: ApiService) {
    this.configuration = configService.getConfiguration();
  }

  getUsers(): Observable<User[]> {
    return this.apiService.getUsers();
  }

  getUser(login: string): Observable<User> {
    return this.apiService.getUser(login);
  }

  saveUser(user: User): Observable<User> {
    return this.http.put( this.configuration.backendUrl + 'users/' + user.login, user )
      .catch( err => this.errorService.handle( err ) );
  }

  createUser(user: User): Observable<User> {
    return this.http.post( this.configuration.backendUrl + 'users/' + user.login, user )
      .catch( err => this.errorService.handle( err ) );
  }

  deleteUser(login: string): Observable<null> {
    return this.http.delete( this.configuration.backendUrl + 'users/' + login )
      .catch( err => this.errorService.handle( err ) );
  }

}
