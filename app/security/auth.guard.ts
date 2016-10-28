import {Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot} from "@angular/router";
import {AuthService} from "../services/security/auth.service";
import {Injectable} from "@angular/core";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    // If user is not logged in we'll send them to the homepage
    if (!this.auth.loggedIn()) {
      this.auth.redirectUrl = url;
      this.router.navigate(['/login']);
      return false;
    }
    return true;
    /*if (localStorage.getItem('currentUser')) {
      // logged in so return true
      return true;
    }

    this.router.navigate(['/login']);
    return false;*/
  }
}