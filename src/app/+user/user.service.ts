import {Injectable} from '@angular/core';
import {ConfigService} from '../config/config.service';
import {Observable} from 'rxjs';
import {ErrorService} from '../services/error.service';
import {AuthHttp} from 'angular2-jwt';
import {User} from './user';

@Injectable()
export class UserService {

  constructor(private http: AuthHttp, private configService: ConfigService,
              private errorService: ErrorService) {
  }

  getUsers(): Observable<User[]> {
    return this.http.get( this.configService.backendUrl + 'users' )
      .map( resp => resp.json() )
      .map( (data: any[]) => {
        let result: any[] = [];
        data.forEach( item => {
          result.push( {
            login: item._id,
            firstName: item.firstName,
            lastName: item.lastName,
            roles: item.roles
          } );
        } );
        return result;
      } );
  }

  getUser(login: string): Observable<User> {
    return this.http.get( this.configService.backendUrl + 'users/' + login )
      .map( resp => resp.json() )
      /*.map( json => {
        json.roles = json.roles.map( (role: number) => role + '');
        return json;
      } )*/
      .catch( err => this.errorService.handle( err ) );
  }

  saveUser(user: User): Observable<User> {
    return this.http.put( this.configService.backendUrl + 'users/' + user.login, user )
    // .map( resp => resp.json() )
      .catch( err => this.errorService.handle( err ) );
  }

  createUser(user: User): Observable<User> {
    return this.http.post( this.configService.backendUrl + 'users/' + user.login, user )
    // .map( resp => resp.json() )
      .catch( err => this.errorService.handle( err ) );
  }

  deleteUser(login: string): Observable<null> {
    return this.http.delete( this.configService.backendUrl + 'users/' + login )
      .catch( err => this.errorService.handle( err ) );
  }

}
