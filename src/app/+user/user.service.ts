import { Injectable } from '@angular/core';
import { ConfigService, Configuration } from '../services/config.service';
import { ErrorService } from '../services/error.service';
import { User } from './user';
import { ApiService } from '../services/ApiService';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/index';
import { catchError } from 'rxjs/internal/operators';

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
    return this.http.put<User>( this.configuration.backendUrl + 'users/' + user.login, user )
      .pipe(
        catchError( err => this.errorService.handle( err ) )
      );
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>( this.configuration.backendUrl + 'users/' + user.login, user )
      .pipe(
        catchError( err => this.errorService.handle( err ) )
      );
  }

  deleteUser(login: string): Observable<any> {
    return this.http.delete( this.configuration.backendUrl + 'users/' + login )
      .pipe(
        catchError( err => this.errorService.handle( err ) )
      );
  }

}
