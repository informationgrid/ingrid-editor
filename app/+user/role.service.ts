import {Injectable} from '@angular/core';
import {ConfigService} from '../config/config.service';
import {Observable} from 'rxjs';
import {ErrorService} from '../services/error.service';
import {AuthHttp} from 'angular2-jwt';

export interface Role {
  id: string;
  name: string;
}

@Injectable()
export class RoleService {

  constructor(private http: AuthHttp, private configService: ConfigService,
    private errorService: ErrorService) {
  }

  getRoles(): Observable<any[]> {
    return this.http.get( this.configService.backendUrl + 'roles' )
      .map( resp => this.prepareRoles(resp.json()));
  }

  getRole(id: string): Observable<any> {
    return this.http.get( this.configService.backendUrl + 'role/' + id)
      .map( resp => this.prepareRoles([resp.json()])[0] )
      .catch( err => this.errorService.handle(err));
  }

  prepareRoles(roles: any[]) {
    let result: any[] = [];
    roles.forEach( role => {
      result.push( {
        id: role._id,
        name: role.name
      } );
    } );
    return result;
  }

  saveRole(role: Role): Observable<any> {
    return this.http.post( this.configService.backendUrl + 'role/' + role.id, role )
      // .map( resp => resp.json() )
      .catch( err => this.errorService.handle(err));
  }

  createRole(role: Role): Observable<any> {
    return this.http.put( this.configService.backendUrl + 'role/' + role.id, role )
      // .map( resp => resp.json() )
      .catch( err => this.errorService.handle(err));
  }

  deleteRole(login: string): Observable<any> {
    return this.http.delete( this.configService.backendUrl + 'role/' + login )
      .catch( err => this.errorService.handle(err));
  }

}