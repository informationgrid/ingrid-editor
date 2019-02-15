import {Observable} from "rxjs";
import {User} from "../../+user/user";
import {map} from "rxjs/operators";
import {ConfigService, Configuration} from "../config/config.service";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  getUsers(): Observable<User[]> {
    return this.http.get( this.configuration.backendUrl + 'users' )
      .pipe(
        map( (json: any[]) => {
          const result: User[] = [];
          json.forEach( item => {
            result.push( {
              id: item.id,
              login: item.login,
              firstName: item.firstName,
              lastName: item.lastName,
              roles: item.roles,
              attributes: item.attributes
            } );
          } );
          return result;
        } )
      );
  }

  saveUser(user: User): Observable<User> {
    return this.http.put<User>( this.configuration.backendUrl + 'users/' + user.login, user )
      .pipe(
        // catchError( err => this.errorService.handle( err ) )
      );
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>( this.configuration.backendUrl + 'users/' + user.login, user )
      .pipe(
        // catchError( err => this.errorService.handle( err ) )
      );
  }

  deleteUser(login: string): Observable<any> {
    return this.http.delete( this.configuration.backendUrl + 'users/' + login )
      .pipe(
        // catchError( err => this.errorService.handle( err ) )
      );
  }



  getUser(id: string): Observable<User> {
    return this.http.get( this.configuration.backendUrl + 'users/' + id )
      .pipe(
        map( (json: any) => {
          return {
            id: json.id,
            login: json.login,
            firstName: json.firstName,
            lastName: json.lastName,
            roles: json.roles,
            attributes: json.attributes
          };
        } )
      );
  }

}
