import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
