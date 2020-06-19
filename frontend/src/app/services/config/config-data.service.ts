import {Configuration, UserInfo} from './config.service';
import {Catalog} from '../../+catalog/services/catalog.model';

export class ConfigDataService {

  config: Configuration;

  load(url: string): Promise<any> {
    return this.sendRequest('GET', url)
      .then(response => JSON.parse(response));
  }

  getCurrentUserInfo(): Promise<UserInfo> {
    return this.sendRequest('GET', this.config.backendUrl + 'info/currentUser')
      // TODO: if database is not initialized then response is not JSON
      //       change backend response or catch parse error
      .then(response => {
        const json = JSON.parse(response);
        return {
          assignedCatalogs: json.assignedCatalogs,
          name: json.name,
          roles: json.roles,
          userId: json.userId,
          currentCatalog: json.currentCatalog ? new Catalog(json.currentCatalog) : {},
          catalogProfile: json.catalogProfile
        } as UserInfo;
      })
      .catch((e: string) => {
        if (e.indexOf('Cannot GET /sso/login') !== -1) {
          console.error('Not logged in to keycloak. Please login first from IgeServer (localhost:8550)');
          return null;
        } else if (e.indexOf('Error occured while trying to proxy to') !== -1) {
          console.error('No running backend');
          throw new Error('Backend does not seem to run');
        } else {
          console.error('Could not get current user info', e);
        }
        return {
          assignedCatalogs: [],
          name: undefined,
          roles: [],
          userId: undefined,
          catalogProfile: undefined,
          currentCatalog: undefined
        };
      });
  }

  private sendRequest(method = 'GET', url = null): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.overrideMimeType('application/json');
      xhr.open(method, url, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            let error;
            try {
              error = JSON.parse(xhr.responseText);
            } catch (e) {
              error = xhr.responseText
            }
            reject(error);
          }
        }
      };
      xhr.send(null);
    });
  }

}
