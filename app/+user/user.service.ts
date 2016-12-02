import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {ConfigService} from '../config/config.service';
import {Observable} from 'rxjs';

@Injectable()
export class UserService {

  constructor(private http: Http, private configService: ConfigService) {
  }

  getUsers(): Observable<any[]> {
    return this.http.get( this.configService.backendUrl + 'user/list' )
      .map( resp => resp.json() )
      .map( (data: any[]) => {
        let result: any[] = [];
        data.forEach( item => {
          result.push( {
            id: item._id,
            name: item._id
          } );
        } );
        return result;
      } );
  }
}