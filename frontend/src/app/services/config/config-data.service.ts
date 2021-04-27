import {Configuration, UserInfo} from './config.service';
import {Catalog} from '../../+catalog/services/catalog.model';
import {IgeException} from '../../server-validation.util';

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
          firstName: json.firstName,
          lastName: json.lastName,
          roles: json.roles,
          userId: json.userId,
          currentCatalog: json.currentCatalog ? new Catalog(json.currentCatalog) : {},
          catalogProfile: json.catalogProfile,
          version: json.version,
          lastLogin: new Date(json.lastLogin),
          useElasticsearch: json.useElasticsearch
        } as UserInfo;
      })
      .catch((e: IgeException | string) => {
        if (typeof e === 'string') {
          if (e.indexOf('Cannot GET /sso/login') !== -1) {
            console.error('Not logged in to keycloak. Please login first from IgeServer (localhost:8550)');
            return null;
          } else if (e.indexOf('Error occured while trying to proxy to') !== -1) {
            console.error('No running backend');
            throw new Error('Backend does not seem to run');
          } else {
            console.error('Could not get current user info', e);
          }
        } else {
          throw new Error(e.errorText);
        }
        return {
          assignedCatalogs: [],
          name: undefined,
          firstName: undefined,
          lastName: undefined,
          roles: [],
          userId: undefined,
          catalogProfile: undefined,
          currentCatalog: undefined,
          version: undefined,
          useElasticsearch: false
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
