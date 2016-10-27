import {Router} from "@angular/router";
import {Injectable} from "@angular/core";
import {tokenNotExpired} from "angular2-jwt";
import {Observable} from "rxjs";
import {Response, Http} from "@angular/http";
declare var Auth0Lock: any;

@Injectable()
export class AuthService {

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  public token: string;

  constructor(private http: Http, private router: Router) {
    // set token if saved in local storage
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post('http://localhost:8080/v1/user/login', JSON.stringify({username: username, password: password}))
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        let token = response.json() && response.json().token;
        if (token) {
          // set token property
          this.token = token;

          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify({username: username, token: token}));

          // return true to indicate successful login
          return true;
        } else {
          // return false to indicate failed login
          return false;
        }
      });
  }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  // Finally, this method will check to see if the user is logged in. We'll be able to tell by checking to see if they have a token and whether that token is valid or not.
  loggedIn() {
    return this.token !== null; // tokenNotExpired();
  }
}