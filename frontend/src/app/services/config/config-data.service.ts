import {Configuration} from "./config.service";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ConfigDataService {

  config: Configuration;

  load(url: string): Promise<any> {
    return this.sendRequest( 'GET', url )
      .then( response => JSON.parse(response));
  }

  getCurrentUserInfo(): Promise<any> {
    return this.sendRequest('GET', this.config.backendUrl + 'info/currentUser' )
    // TODO: if database is not initialized then response is not JSON
    //       change backend response or catch parse error
      .then( response => JSON.parse(response))
      .catch( e => console.error('Could not get current user info', e));
  }

  private sendRequest(method = 'GET', url = null): Promise<string> {
    return new Promise( (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.overrideMimeType( 'application/json' );
      xhr.open( method, url, true );
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve( xhr.responseText );
          } else {
            reject( JSON.parse(xhr.responseText) );
          }
        }
      };
      xhr.send( null );
    } );
  }

}
