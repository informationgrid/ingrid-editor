import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {ConfigService} from '../config/config.service';
import {Observable} from 'rxjs';
import {ErrorService} from "../services/error.service";

export interface User {
 firstName: string;
 lastName: string;
 roles: string[];
 login: string;
 password: string;
}

@Injectable()
export class UserService {


  constructor(private http: Http, private configService: ConfigService,
    private errorService: ErrorService) {
  }

  getUsers(): Observable<any[]> {
    return this.http.get( this.configService.backendUrl + 'user/list' )
      .map( resp => resp.json() )
      .map( (data: any[]) => {
        let result: any[] = [];
        data.forEach( item => {
          result.push( {
            id: item._id,
            name: item._id,
            firstName: item.firstName,
            lastName: item.lastName,
            roles: item.roles
          } );
        } );
        return result;
      } );
  }

  getUser(login: string): Observable<any> {
    return this.http.get( this.configService.backendUrl + 'user/' + login)
      .map( resp => resp.json() )
      .catch( err => this.errorService.handle(err));
  }

  saveUser(user: User): Observable<any> {
    return this.http.post( this.configService.backendUrl + 'user/' + user.login, user )
      .map( resp => resp.json() )
      .catch( err => this.errorService.handle(err));
  }

  deleteUser(login): Observable<any> {
    return this.http.delete( this.configService.backendUrl + 'user/' + login, user )
      .catch( err => this.errorService.handle(err));
  }

}