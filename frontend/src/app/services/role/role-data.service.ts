import {Observable} from "rxjs";
import {ConfigService, Configuration} from "../config/config.service";
import {HttpClient} from "@angular/common/http";
import {Role} from "../../models/user-role";
import {map} from "rxjs/operators";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class RoleDataService {

  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  getRoleMapping(id: string): Observable<any> {
    return this.http.get(this.configuration.backendUrl + 'roles/' + id);
  }

  saveRole(role: Role): Observable<any> {
    // TODO: after saving role reassign role to active user. Necessary? User should not edit his own role!!!
    return this.http.put(this.configuration.backendUrl + 'roles/' + role.name, role)
      .pipe(
        // catchError(err => this.errorService.handle(err))
      );
  }

  createRole(role: Role): Observable<any> {
    return this.http.post(this.configuration.backendUrl + 'roles/' + role.name, role)
      .pipe(
        // catchError(err => this.errorService.handle(err))
      );
  }

  // delete group metadata from backend
  deleteRole(id: string): Observable<any> {
    return this.http.delete(this.configuration.backendUrl + 'roles/' + name)
      .pipe(
        // catchError(err => this.errorService.handle(err))
      );

    // TODO: also delete from keycloak
    // this.apiService.removeGroup(id);
  }

  getGroups(): Observable<Role[]> {

    try {
      return this.http.get( this.configuration.backendUrl + 'groups' )
        .pipe(
          map( (json: any[]) => {
            const result: Role[] = [];
            json.forEach( item => {
              result.push( {
                id: item.id,
                name: item.name,
                attributes: [],
                datasets: [],
                pages: null
              } );
            } );
            return result;
          } )
        );
    } catch (e) {
      console.error( 'Could not get groups' );
      return Observable.create( [] );
    }
  }

  getGroup(id: string): Observable<Role> {
    return this.http.get( this.configuration.backendUrl + 'groups/' + id )
      .pipe(
        map( (json: any) => {
          return {
            id: json.id,
            name: '?',
            attributes: [],
            datasets: [],
            pages: null
          };
        } )
      );
  }

}
