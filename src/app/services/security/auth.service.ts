import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import {ConfigService} from '../../config/config.service';
import {JwtHelper, tokenNotExpired} from 'angular2-jwt';

@Injectable()
export class AuthService {

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  // the token from the server used for authentication
  public token: string;

  // contains the role ids
  roles: string[];

  // contains the whole roles with its permissions
  rolesDetail: any[];

  tokenName = 'id_token';

  public loginStatusChange = new Subject<boolean>();
  public loginStatusChange$ = this.loginStatusChange.asObservable();

  // TODO: handle refresh token: https://github.com/auth0/angular2-jwt/issues/197

  constructor(private http: Http, private router: Router, private configService: ConfigService) {
    // set token if saved in local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.rolesDetail = currentUser && currentUser.rolesDetail;

    if (this.token) {
      this.roles = this.getRolesFromToken(this.token);
    }
  }

  getRolesFromToken(token: any): string[] {
    const jwt = new JwtHelper();
    return jwt.decodeToken(token).roles;
  }

  login(username: string, password: string): Observable<boolean> {
    const body = 'username=' + username + '&password=' + password;
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded'});
    const options = new RequestOptions({ headers: headers });

    return this.http.post( this.configService.backendUrl + 'user/login', body, options)
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        const result = response.json();
        const token =  result && result.token;
        if (token) {
          // set token property
          this.token = token;
          this.roles = this.getRolesFromToken(this.token);
          this.rolesDetail = result.roles;

          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify({username: username, token: token, rolesDetail: this.rolesDetail}));
          localStorage.setItem(this.tokenName, token);
          this.loginStatusChange.next(true);

          // TODO: setup a session refresh before the token expires
          // call backend to get a new access token

          // return true to indicate successful login
          return true;
        } else {
          // return false to indicate failed login
          this.loginStatusChange.next(false);
          return false;
        }
      });
  }

  getAccessiblePages(): string[] {
    if (!this.rolesDetail) {
      return [];
    }

    const pages = this.rolesDetail
      .map( role => role.pages ) // collect all pages
      .filter( page => page );   // remove 'undefined' values

    return pages[0] ? pages[0] : [];
  }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    this.loginStatusChange.next(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem(this.tokenName);
    this.router.navigate(['/login']);
  }

  hasRole(otherRoles: string[]): boolean {
    const intersect = otherRoles.filter(otherRole => {
      return this.roles && this.roles.indexOf(otherRole) !== -1;
    });

    return intersect.length > 0;
  }

  // Finally, this method will check to see if the user is logged in. We'll be able to tell by checking to see if they
  // have a token and whether that token is valid or not.
  loggedIn() {
    return tokenNotExpired(this.tokenName);
  }
}
