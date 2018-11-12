import {Configuration} from "./config.service";

export class ConfigDataService {

  config: Configuration;

  load(url: string): Promise<any> {
    return this.sendRequest( 'GET', url )
      .then( response => JSON.parse(response));
  }

  getCurrentUserInfo(): Promise<any> {
    return this.sendRequest('GET', this.config.backendUrl + 'info/currentUser' )
      .then( response => JSON.parse(response));
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
