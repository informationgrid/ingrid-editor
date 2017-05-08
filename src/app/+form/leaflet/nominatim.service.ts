import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class NominatimService {

  url = 'https://nominatim.openstreetmap.org';
  searchInCountries = 'de';

  constructor(private http: Http) {
  }

  search(query: string): Observable<any> {
    return this.http.get( this.url + '/search/' + query + '?format=json&countrycodes=' + this.searchInCountries )
      .map(res => res.json());
  }
}
