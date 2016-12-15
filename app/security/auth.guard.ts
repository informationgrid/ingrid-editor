import {Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot} from "@angular/router";
import {AuthService} from "../services/security/auth.service";
import {Injectable} from "@angular/core";
import {ModalService} from "../services/modal/modal.service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router, private modalService: ModalService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    // If user is not logged in we'll send them to the homepage
    if (!this.auth.loggedIn()) {
      // return (roles == null || roles.indexOf("the-logged-user-role") != -1);

      this.auth.redirectUrl = url;
      this.router.navigate(['/login']);
      return false;
    }
    let roles = route.data['roles'] as Array<string>;

    let validPages = this.auth.getAccessiblePages();
    let mayContinue = validPages.length === 0 || validPages.indexOf(this.router.url) !== -1;

    if (!roles || this.auth.hasRole(roles) || mayContinue) {
      return true;
    } else {
      this.modalService.showError('Sie haben nicht die nötigen Rechte!');
      return false;
    }
    /*if (localStorage.getItem('currentUser')) {
      // logged in so return true
      return true;
    }

    this.router.navigate(['/login']);
    return false;*/
  }
}