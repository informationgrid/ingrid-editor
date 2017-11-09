import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class NominatimService {

  url = 'https://nominatim.openstreetmap.org';
  searchInCountries = 'de';

  constructor(private http: HttpClient) {
  }

  search(query: string): Observable<any> {
    return this.http.get( this.url + '/search/' + query + '?format=json&countrycodes=' + this.searchInCountries );
  }
}
