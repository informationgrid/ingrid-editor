import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Response, Http, RequestOptions, Headers} from '@angular/http';
import {ConfigService} from '../../config/config.service';
import {tokenNotExpired} from "angular2-jwt";

@Injectable()
export class AuthService {

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  public token: string;

  public loginStatusChange = new Subject<boolean>();
  public loginStatusChange$ = this.loginStatusChange.asObservable();

  constructor(private http: Http, private router: Router, private configService: ConfigService) {
    // set token if saved in local storage
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  login(username: string, password: string): Observable<boolean> {
    let body = 'username=' + username + '&password=' + password;
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded'});
    let options = new RequestOptions({ headers: headers });

    return this.http.post( this.configService.backendUrl + 'user/login', body, options)
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        let token = response.json() && response.json().token;
        if (token) {
          // set token property
          this.token = token;

          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify({username: username, token: token}));
          localStorage.setItem('id_token', token);
          this.loginStatusChange.next(true);

          // return true to indicate successful login
          return true;
        } else {
          // return false to indicate failed login
          this.loginStatusChange.next(false);
          return false;
        }
      });
  }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    this.loginStatusChange.next(false);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  // Finally, this method will check to see if the user is logged in. We'll be able to tell by checking to see if they have a token and whether that token is valid or not.
  loggedIn() {
    return tokenNotExpired();
  }
}